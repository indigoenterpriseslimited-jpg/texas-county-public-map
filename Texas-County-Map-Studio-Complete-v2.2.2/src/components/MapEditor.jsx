import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as d3 from 'd3';
import texasCounties from '../data/texas-counties.json';
import { statusDefinition } from '../county-schema';
import '../styles/map-editor.css';

const WIDTH = 960;
const HEIGHT = 680;

// D3's spherical polygon convention is the reverse of RFC 7946 GeoJSON.
// Reverse every ring for rendering so official Census polygons do not become
// inside-out shapes that cover one another.
const reverseGeometryRings = (geometry) => {
  if (geometry.type === 'Polygon') {
    return { ...geometry, coordinates: geometry.coordinates.map((ring) => [...ring].reverse()) };
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) => (
        polygon.map((ring) => [...ring].reverse())
      ))
    };
  }
  return geometry;
};

const renderableTexasCounties = {
  ...texasCounties,
  features: texasCounties.features.map((feature) => ({
    ...feature,
    geometry: reverseGeometryRings(feature.geometry)
  }))
};

const MapEditor = forwardRef(function MapEditor({
  counties,
  districts,
  selectedCounty,
  onCountyActivate,
  baseColor,
  mapStyle,
  statusColors,
  preview
}, ref) {
  const svgRef = useRef(null);
  const [hoveredCounty, setHoveredCounty] = useState(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const projection = d3.geoMercator().fitExtent(
      [[28, 24], [WIDTH - 28, HEIGHT - 24]],
      renderableTexasCounties
    );
    const pathGenerator = d3.geoPath(projection);

    svg.append('rect').attr('width', WIDTH).attr('height', HEIGHT).attr('fill', '#ebe5d7');

    const defs = svg.append('defs');
    defs.append('filter')
      .attr('id', 'county-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%')
      .append('feDropShadow')
      .attr('dx', 2)
      .attr('dy', 3)
      .attr('stdDeviation', 2)
      .attr('flood-color', '#17231f')
      .attr('flood-opacity', 0.28);

    const mapGroup = svg.append('g').attr('class', 'counties-layer');

    const paths = mapGroup
      .selectAll('path')
      .data(renderableTexasCounties.features, (feature) => feature.properties.fips)
      .join('path')
      .attr('d', pathGenerator)
      .attr('class', (feature) => {
        const disabled = preview && counties[feature.properties.name]?.clickable === false;
        return disabled ? 'county-shape is-disabled' : 'county-shape';
      })
      .attr('data-county', (feature) => feature.properties.name)
      .attr('fill', (feature) => {
        const county = counties[feature.properties.name] || {};
        if (county.color) return county.color;
        if (county.status && county.status !== 'unassigned') return statusColors?.[county.status] || statusDefinition(county.status).color;
        return baseColor;
      })
      .attr('stroke', (feature) => {
        if (feature.properties.name === selectedCounty) return '#ffcc00';
        const county = counties[feature.properties.name] || {};
        return county.districtId && districts[county.districtId]
          ? districts[county.districtId].color
          : '#f7f0df';
      })
      .attr('stroke-width', (feature) => {
        if (feature.properties.name === selectedCounty) return 3.5;
        const county = counties[feature.properties.name] || {};
        return county.districtId && districts[county.districtId] ? 2.1 : 0.75;
      })
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (feature) => `${feature.properties.name} County`)
      .attr('aria-disabled', (feature) => preview && counties[feature.properties.name]?.clickable === false ? 'true' : null)
      .style('filter', mapStyle === 'embossed' ? 'url(#county-shadow)' : 'none')
      .on('click', (event, feature) => {
        event.stopPropagation();
        onCountyActivate(feature.properties.name);
      })
      .on('keydown', (event, feature) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onCountyActivate(feature.properties.name);
        }
      })
      .on('mouseenter focus', function onEnter(event, feature) {
        d3.select(this).classed('is-hovered', true).raise();
        setHoveredCounty(feature.properties.name);
      })
      .on('mouseleave blur', function onLeave() {
        d3.select(this).classed('is-hovered', false);
        setHoveredCounty(null);
      });

    paths.append('title').text((feature) => {
      const county = counties[feature.properties.name] || {};
      const district = county.districtId ? districts[county.districtId]?.name : '';
      return `${county.customName || feature.properties.name} County${district ? ` · ${district}` : ''}`;
    });
  }, [baseColor, counties, districts, mapStyle, onCountyActivate, preview, selectedCounty, statusColors]);

  useImperativeHandle(ref, () => ({
    getSvgMarkup() {
      if (!svgRef.current) return '';
      const clone = svgRef.current.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', WIDTH);
      clone.setAttribute('height', HEIGHT);
      return new XMLSerializer().serializeToString(clone);
    },
    async downloadImage(format = 'jpeg') {
      if (!svgRef.current) return;
      const clone = svgRef.current.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', WIDTH);
      clone.setAttribute('height', HEIGHT);
      const markup = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
      const imageUrl = URL.createObjectURL(svgBlob);
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = imageUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = WIDTH * 2;
      canvas.height = HEIGHT * 2;
      const context = canvas.getContext('2d');
      context.fillStyle = '#ebe5d7';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(imageUrl);
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      const extension = format === 'png' ? 'png' : 'jpg';
      const anchor = document.createElement('a');
      anchor.href = canvas.toDataURL(mime, .94);
      anchor.download = `texas-county-map.${extension}`;
      anchor.click();
    }
  }), []);

  const activeName = hoveredCounty || selectedCounty;
  const activeData = activeName ? counties[activeName] || {} : null;
  const activeDistrict = activeData?.districtId ? districts[activeData.districtId] : null;

  return (
    <div className="map-editor">
      <svg
        ref={svgRef}
        className="map-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Interactive map of all 254 Texas counties"
      />
      <div className={`county-readout ${activeName ? 'is-visible' : ''}`} aria-live="polite">
        {activeName ? (
          <>
            <strong>{activeData?.customName || activeName} County</strong>
            {activeDistrict && <span>{activeDistrict.name}</span>}
          </>
        ) : (
          <span>Point to a county to identify it</span>
        )}
      </div>
    </div>
  );
});

export default MapEditor;
