export const REFERENCE_DISTRICTS = {
  'district-01': { id: 'district-01', name: 'District 01', color: '#0000ff' },
  'district-02': { id: 'district-02', name: 'District 02', color: '#8f8f8f' },
  'district-03': { id: 'district-03', name: 'District 03', color: '#ed1c24' }
};

const DISTRICT_01 = new Set([
  'Andrews','Armstrong','Bailey','Borden','Brewster','Briscoe','Carson','Castro','Childress','Cochran','Coke','Collingsworth','Concho','Cottle','Crane','Crockett','Crosby','Culberson','Dallam','Dawson','Deaf Smith','Dickens','Donley','Ector','El Paso','Fisher','Floyd','Foard','Gaines','Garza','Glasscock','Gray','Hale','Hall','Hansford','Hardeman','Hartley','Haskell','Hemphill','Hockley','Howard','Hudspeth','Hutchinson','Irion','Jeff Davis','Jones','Kent','King','Knox','Lamb','Lipscomb','Loving','Lubbock','Lynn','Martin','Midland','Mitchell','Moore','Motley','Nolan','Ochiltree','Oldham','Parmer','Pecos','Potter','Presidio','Randall','Reagan','Reeves','Roberts','Runnels','Schleicher','Scurry','Sherman','Sterling','Stonewall','Sutton','Swisher','Taylor','Terrell','Terry','Tom Green','Upton','Val Verde','Ward','Wheeler','Winkler','Yoakum'
]);

const DISTRICT_03 = new Set([
  'Atascosa','Austin','Bandera','Bastrop','Bee','Bexar','Blanco','Brazoria','Brazos','Brooks','Burleson','Caldwell','Calhoun','Cameron','Chambers','Colorado','Comal','DeWitt','Dimmit','Duval','Edwards','Fayette','Fort Bend','Frio','Galveston','Gillespie','Goliad','Gonzales','Grimes','Guadalupe','Hardin','Harris','Hays','Hidalgo','Jackson','Jasper','Jefferson','Jim Hogg','Jim Wells','Karnes','Kendall','Kenedy','Kerr','Kimble','Kinney','Kleberg','La Salle','Lavaca','Lee','Liberty','Live Oak','Llano','Madison','Mason','Matagorda','Maverick','McMullen','Medina','Menard','Montgomery','Newton','Nueces','Orange','Polk','Real','Refugio','San Jacinto','San Patricio','Starr','Travis','Tyler','Uvalde','Victoria','Walker','Waller','Washington','Webb','Wharton','Willacy','Wilson','Zapata','Zavala'
]);

export const buildReferenceCountyAssignments = (countyNames) => Object.fromEntries(
  countyNames.map((name) => [name, {
    districtId: DISTRICT_01.has(name) ? 'district-01' : DISTRICT_03.has(name) ? 'district-03' : 'district-02'
  }])
);
