/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = "pk.eyJ1IjoiZGVubmlzeWFrb3ZsZXY0MCIsImEiOiJjbHMyNnViazIwMHB5MmpvNHlvc3B2bDQ2In0.nTDRJJnhgM_EW8tSwyOchg";

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/dennisyakovlev40/clskppghq03u401p2c3184488',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.72],  // starting point, longitude/latitude
    // cetner: [-74.35, 40.70],
    zoom: 10 // starting zoom level
});

/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
//      Use the fetch method to access the GeoJSON from your online repository
//      Convert the response to JSON format and then store the response in your new variable


var crashes_mine;

fetch('https://raw.githubusercontent.com/dennisyakovlev/ggr472-lab4/master/data/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(response => {
        crashes_mine = response;
    })
    .catch(err => {
        throw new Error('Problem loading');
    });

function dataParse(data)
{
    const features = turf.featureCollection(data.features);
    const bbox = turf.envelope(features);
    const poly = turf.polygon(bbox.geometry.coordinates);
    const bboxTrans = turf.transformScale(poly.geometry, 1.2);
    const newBbox = turf.envelope(bboxTrans);
    const hexGrid = turf.hexGrid(newBbox.bbox, 0.5, 'kilometers');
    const collected = turf.collect(hexGrid, data, "_id", "values")


    const shouldPick = (i, colSz) => {
        return  collected.features[i - colSz].properties.values.length     +   // left
                collected.features[i - colSz - 1].properties.values.length +   // left
                collected.features[i - colSz + 1].properties.values.length +   // left

                collected.features[i - 1].properties.values.length           + // up
                collected.features[i + 1].properties.values.length           + // down

                collected.features[i + colSz - 1].properties.values.length +   // right
                collected.features[i + colSz + 1].properties.values.length +   // right
                collected.features[i + colSz].properties.values.length;        // right
    };
    

    const colSize = 38;
    const rowSize = 63;
    let arr = [];
    // cols alternate in 38,37 size
    // ignore first 2 + last col, they dont have data anyways
    for (var col=2, i=colSize*2-1; col!=rowSize-1; ++col)
    {
        // i+=1;
        for (var row=0; row!=colSize-(col%2); ++row,++i)
        {
            console.log(i)
            if (shouldPick(i, colSize-(col%2)) > 0)
            {
                arr.push(collected.features[i]);
            }
        }
    }
    collected.features = arr;

    return collected
}

map.on('load', () => {

    const processed_THREE = dataParse(crashes_mine);

    map.addSource('crashes', {
        type: 'geojson',
        data: crashes_mine
    });

    map.addSource('hexGrid', {
        type: 'geojson',
        data: processed_THREE
    });

    map.addLayer({
        id: 'crashesHexGrid',
        type: 'fill',
        source: 'hexGrid',
        layout: {},
        paint: {
            'fill-color': [
                'case',
                ['<=', ['length', ['get', 'values']], 0], '#2D00F7',
                ['<=', ['length', ['get', 'values']], 2], '#6A00F4',
                ['<=', ['length', ['get', 'values']], 4], '#8900F2',
                ['<=', ['length', ['get', 'values']], 6], '#A100F2',
                ['<=', ['length', ['get', 'values']], 8], '#B100E8',
                ['<=', ['length', ['get', 'values']], 10], '#BC00DD',
                ['<=', ['length', ['get', 'values']], 12], '#D100D1',
                ['<=', ['length', ['get', 'values']], 16], '#DB00B6',
                ['<=', ['length', ['get', 'values']], 20], '#E500A4',
                ['<=', ['length', ['get', 'values']], 100], '#F20089',
                'red'
            ],
            'fill-opacity': 0.6
        }
    });

    // points ontop of hex grid
    map.addLayer({
        id: 'crashesPoint',
        type: 'circle',
        source: 'crashes',
        paint: {
            'circle-color': 'orange',
            'circle-opacity': 0,
            'circle-radius': 5,
            'circle-stroke-width': 1,
            'circle-stroke-color': 'black',
            'circle-stroke-opacity': 0
        },
        visibility: 'none'
    });

    const menu = new Menu('menu-1');
    menu.enableAnim();

    // NOTE: set the visibility to none/visible since this improves
    //       the map performance
    //       this current messes up animation of layers, later use
    //       TransitionEndListener to set this nicely after anim end

    const buttonAccidents = new Button('btn-2');
    buttonAccidents.enableAnim();
    buttonAccidents.addOnFunc((e,state) => {
        // map.setLayoutProperty('crashesPoint', 'visibility', 'visible');
        map.setPaintProperty('crashesPoint', 'circle-opacity', 1);
        map.setPaintProperty('crashesPoint', 'circle-stroke-opacity', 1);
    });
    buttonAccidents.addOffFunc((e,state) => {
        // map.setLayoutProperty('crashesPoint', 'visibility', 'none');
        map.setPaintProperty('crashesPoint', 'circle-opacity', 0);
        map.setPaintProperty('crashesPoint', 'circle-stroke-opacity', 0);
    });

    const buttonHexgrid = new Button('btn-3');
    buttonHexgrid.enableAnim();
    buttonHexgrid.addOnFunc((e,state) => {
        // map.setLayoutProperty('crashesHexGrid', 'visibility', 'none');
        map.setPaintProperty('crashesHexGrid', 'fill-opacity', 0);
    });
    buttonHexgrid.addOffFunc((e,state) => {
        // map.setLayoutProperty('crashesHexGrid', 'visibility', 'visible');
        map.setPaintProperty('crashesHexGrid', 'fill-opacity', 0.6);
    });

});
