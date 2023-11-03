// Ajout de la carte 
var map = L.map('carte').setView([2.75, 47], 2)

// variable contenant les fonds de carte 
// Fond de carte ESRI Vue Aérienne
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Fond de carte du plan IGN
var planign = L.tileLayer('https://wxs.ign.fr/{apikey}/geoportail/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE={style}&TILEMATRIXSET=PM&FORMAT={format}&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
    attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
    bounds: [
        [-75, -180],
        [81, 180]
    ],
    minZoom: 2,
    maxZoom: 18,
    apikey: 'choisirgeoportail',
    format: 'image/png',
    style: 'normal'
});

// Fond de carte Orthophotos de l'IGN
var orthoign = L.tileLayer('https://wxs.ign.fr/{apikey}/geoportail/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE={style}&TILEMATRIXSET=PM&FORMAT={format}&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
    attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
    bounds: [
        [-75, -180],
        [81, 180]
    ],
    minZoom: 2,
    maxZoom: 19,
    apikey: 'choisirgeoportail',
    format: 'image/jpeg',
    style: 'normal'
});

// Fond de carte Stamen d'openstreetmaps
var planPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);


// Flux wms des cours d'eau de france par Sandre
var CoursEau = L.tileLayer.wms('https://services.sandre.eaufrance.fr/geo/topage?', {
    layers: 'CoursEau_FXX',
    attribution: '<a target="_blank" href="https://www.sandre.eaufrance.fr/">Sandre France</a>',
    format: 'image/png',
    transparent: true,
    opacity: 0.8
});

// Flux wms des plans d'eau de france par Sandre
var PlanEau = L.tileLayer.wms('https://services.sandre.eaufrance.fr/geo/topage?', {
    layers: 'PlanEau_FXX',
    attribution: '<a target="_blank" href="https://www.sandre.eaufrance.fr/">Sandre France</a>',
    format: 'image/png',
    transparent: true
});

// Flux wms du cadastre de France (IGN)
var cadastreIgn = L.tileLayer.wms('https://wxs.ign.fr/{apikey}/geoportail/r/wms?SERVICE=WMS&REQUEST=GetCapabilities', {
    layers: 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
    attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
    apikey: 'choisirgeoportail',
    format: 'image/png',
    transparent: true
});


// Flux de l'IGN pour la carte corinne Land Cover
var CorLandCover = L.tileLayer('https://wxs.ign.fr/clc/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities', {
    layers: 'LANDCOVER.CLC18',
    attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
    format: 'image/png'
});


// Flux de l'IGN pour la bd Hydro
var Geologie = L.tileLayer.wms('http://geoservices.brgm.fr/WMS-C/?', {
    layers: 'GEOLOGIE',
    attribution: '<a target="_blank" href="https://infoterre.brgm.fr/page/geoservices-ogc">BRGM</a>'
});

var error = document.querySelector(".error");

//Création des données de la carte en fonction du filtre choisi
function creerDonnees(data, filtre, expression) {
    // création d'un nouveau geoJSON
    let newGeoJson = {
        "type": "FeatureCollection",
        "name": "BASOL",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features": []
    };
    // filtrage sur le geoJSON de base
    // on ajoute dans le nouveau geoJSON les données ayant la région que nous avons sélectionnée
    data.features.forEach(element => {
        // console.log("Element : " + element.properties[filtre]);
        // console.log("expression : " + expression);
        var filtreOk = true;
        var region = document.querySelector("#filtre-region").value;
        var dpt = document.querySelector("#filtre-dpt").value;
        var commune = document.querySelector("#filtreCommune").value;
        var pollution = document.querySelector("#filtrePollution").value;
        var entreprise = document.querySelector("#filtreEntreprise").value;
        var recherche = document.querySelector(".searchBar").value;
        //filtre REGION
        if (region != "" && region != element.properties["region"]) {
            filtreOk = false;
        }

        if (dpt != "" && dpt != element.properties["dpt"]) {
            filtreOk = false;
        }

        if (commune != "" && commune != element.properties["commune"]) {
            filtreOk = false;
        }

        console.log(element.properties["nom_classe"])
        if (pollution != "" && !element.properties["nom_classe"].includes(pollution)) {
            filtreOk = false;
        }

        if (entreprise != "" && entreprise != element.properties["nom_site"]) {
            filtreOk = false;
        }

        if (recherche != "" && element.properties["descrip"] != null && element.properties["descrip"].indexOf(recherche) == -1) {
            filtreOk = false;
        }

        if (filtreOk) {
            newGeoJson.features.push(element);
            console.log("push fait !")
        }
    });
    if (newGeoJson.features.length == 0) {
        error.style.display = "block";
        console.log("If passé");
    }
    return newGeoJson;
}


// chargement du nouveau geoJSON avec le même affichage qu'initialement ainsi que les mêmes popup
function afficheDonneesCarte(newGeoJson, map) {

    basolLayer = L.geoJson(newGeoJson, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 5, // taille du cercle du symbole
                fillOpacity: 1, // Opacité du symbole
                color: basolcolor(feature.properties.nom_classe) // appel de la fonction basolColor
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(
                '<p hidden>identifiant :' + feature.properties.id + '</p>' +
                '<h2>Entreprise : ' + feature.properties.nom_site + '</h2>' +
                '<h2>Region : ' + feature.properties.region + '</h2>' +
                '<h2>Polluants : ' + feature.properties.nom_classe + '</h2>' +
                '<button><a href="details.html?id=' + feature.properties.id + '" class="popbut">Lire plus</a></button>'
            )
        },
    }).addTo(map); // ajout à la carte

    // zoom sur les nouvelles données
    console.log(basolLayer.getBounds());
    if (newGeoJson != 0) {
        map.fitBounds(basolLayer.getBounds(), { maxZoom: 9 })
    } else {
        alerte.style.display = "block"
    };
}



// Affichage de l'échelle : par défaut en mètres, en bas à gauche de la carte
L.control.scale({ position: "bottomleft" }).addTo(map);

// fonction pour définir la couleur des points de basol en fonction du type de pollution
// prend en entrée l'attribut selon lequel on veut changer la couleur du symbole, ici il s'agit de feature.properties.nom_classe
function basolcolor(d) {
    return d == 'Aucun' ? '#c8ad7f' : // couleur = beige
        d == 'Micropolluants organiques' ? '#a65628' : // couleur = marron
        d == 'Chimique' ? '#fed906' : // couleur = jaune paille
        d == 'Metaux et metalloides' ? '#999999' : // couleur = gris
        d == 'Phytosanitaires' ? '#4daf4a' : // couleur = vert
        d == 'Element mineraux' ? '#377eb8' : // couleur = bleu
        d == 'Pharmaceutiques et hormones' ? '#f781bf' : // couleur = rose
        d == 'Non renseigné' ? '#ff7f00' : // couleur = orange
        d == 'Informations incompletes' ? '#984ea3' : // couleur = violet
        '#e41a1c'; // couleur = rouge

}

// variable basolLayer qui charge le geoJson de la couche basol
let basolLayer = L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 5, // taille du cercle du symbole
            fillOpacity: 1, // Opacité du symbole
            color: basolcolor(feature.properties.nom_classe) // appel de la fonction basolColor
        });
    },
    // affichage d'une popup pour chaque élément contenu dans le Geojson
    onEachFeature: function(feature, layer) {
        layer.bindPopup(
            '<p hidden>identifiant :' + feature.properties.id + '</p>' +
            '<h2>Entreprise : ' + feature.properties.nom_site + '</h2>' +
            '<h2>Region : ' + feature.properties.region + '</h2>' +
            '<h2>Polluants : ' + feature.properties.nom_classe + '</h2>' +
            '<button><a href="details.html?id=' + feature.properties.id + '" class="popbut">Lire plus</a></button>'
        )
    },
}).addTo(map); // ajour à la carte
//zoom sur la couche chargé
map.fitBounds(basolLayer.getBounds(), { maxZoom: 9 });


// variable contenant les fonds de cartes
var basemaps = {
    "Plan - IGN": planign,
    "Orthophotos - IGN": orthoign,
    "Esri - Images Aériennes": Esri_WorldImagery,
    "Plan - OSM": planPositron,
};
// variables contenant les données supplémentaires
var donnees = {
    "Cadastre": cadastreIgn,
    "basol": basolLayer,
    "Cours d'eau": CoursEau,
    "Plan d'eau": PlanEau,
    "Geologie": Geologie,
    "Corine Land Cover": CorLandCover
};

// ajout d'un gestionnaire de couche (par défaut en haut à droite)
var groupLayer = L.control.layers(basemaps, donnees).addTo(map);


// récupération de l'objet menu déroulant "filtreRegion" de la page html
var filtreRegion = document.getElementById("filtre-region");

// ajout d'un événement lorsque l'on change la valeur dans la liste déroulante
filtreRegion.addEventListener('change', function(event) {

    // on enregistre la valeur sélectionnée
    expression = filtreRegion.value;

    // suppression de la couche basol affichée
    groupLayer.removeLayer(basolLayer);
    map.removeLayer(basolLayer);
    var filtre = "region"
    var newGeoJson = creerDonnees(data, filtre, expression);

    afficheDonneesCarte(newGeoJson, map);

    //Affichage des départements qui correspondent à la région cible
    var newListDpt = Object.keys(dptParRegion[expression])
    console.log(newListDpt)
    var outputdepartement = "<option value=\"\">Choisissez un département</option>";
    // if (expression == "") {

    // } else {
    newListDpt.forEach(el => {
        outputdepartement += "<option>" + el + "</option>";
    });

    document.getElementById('filtre-dpt').innerHTML = outputdepartement;
});


//  Pour liste déroulante des départements
var filtreDepartement = document.getElementById("filtre-dpt");

// ajout d'un événement lorsque l'on change la valeur dans la liste déroulante
filtreDepartement.addEventListener('change', function(event) {

    // on enregistre la valeur sélectionnée
    expression = filtreDepartement.value;
    //console.log(expression)

    // suppression de la couche basol affichée
    groupLayer.removeLayer(basolLayer);
    map.removeLayer(basolLayer);
    var filtre = "dpt"
    var newGeoJson = creerDonnees(data, filtre, expression);

    afficheDonneesCarte(newGeoJson, map);

    var newListCommune = Object.keys(communeParDpt[expression]).sort();
    console.log(newListCommune)
    var outputcommune = "<option value=\"\">Choisissez une commune</option>";
    // if (expression == "") {

    // } else {
    newListCommune.forEach(el => {
        outputcommune += "<option>" + el + "</option>";
    });

    //}
    document.getElementById('filtreCommune').innerHTML = outputcommune;
});



//  Pour liste déroulante des communes
var filtreCommune = document.getElementById("filtreCommune");

// ajout d'un événement lorsque l'on change la valeur dans la liste déroulante
filtreCommune.addEventListener('change', function(event) {

    // on enregistre la valeur sélectionnée
    expression = filtreCommune.value;
    //console.log(expression)

    // suppression de la couche basol affichée
    groupLayer.removeLayer(basolLayer);
    map.removeLayer(basolLayer);
    var filtre = "commune"
    var newGeoJson = creerDonnees(data, filtre, expression);

    afficheDonneesCarte(newGeoJson, map);
});


// //  Pour liste déroulante des type de pollution
var filtrePollution = document.getElementById("filtrePollution");

// ajout d'un événement lorsque l'on change la valeur dans la liste déroulante
filtrePollution.addEventListener('change', function(event) {

    // on enregistre la valeur sélectionnée
    expression = filtrePollution.value;
    console.log(expression)

    // suppression de la couche basol affichée
    groupLayer.removeLayer(basolLayer);
    map.removeLayer(basolLayer);
    var filtre = "nom_classe"
    var newGeoJson = creerDonnees(data, filtre, expression);
    console.log(newGeoJson);
    console.log("fait");
    afficheDonneesCarte(newGeoJson, map);
});


//  Pour liste déroulante des entreprises
var filtreEntreprise = document.getElementById("filtreEntreprise");

// ajout d'un événement lorsque l'on change la valeur dans la liste déroulante
filtreEntreprise.addEventListener('change', function(event) {

    // on enregistre la valeur sélectionnée
    expression = filtreEntreprise.value;
    //console.log(expression)

    // suppression de la couche basol affichée
    groupLayer.removeLayer(basolLayer);
    map.removeLayer(basolLayer);
    var filtre = "nom_site"
    var newGeoJson = creerDonnees(data, filtre, expression);

    afficheDonneesCarte(newGeoJson, map);
});

//Pour la barre de recherche
var search = document.querySelector(".searchBar");

//Ajout d'un événement lorsque l'on change la valeur de l'input
search.addEventListener('change', function(event) {

    // on enregistre la valeur sélectionnée
    expression = search.value;
    //console.log(expression)

    // suppression de la couche basol affichée
    groupLayer.removeLayer(basolLayer);
    map.removeLayer(basolLayer);
    var filtre = "descrip"
    var newGeoJson = creerDonnees(data, filtre, expression);

    afficheDonneesCarte(newGeoJson, map);
});

// Ajout de la légende sur la cartographie
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    label = ['<strong>Type de pollution</strong>'],
        categories = ['Aucun', 'Micropolluants organiques', 'Chimique', 'Metaux et metalloides', 'Phytosanitaires', 'Element mineraux', 'Pharmaceutiques et hormones', 'Non renseigné', 'Informations incompletes', 'Pollution multiple'];
    div.innerHTML = label.join() + '<br>';
    for (var i = 0; i < categories.length; i++) {
        div.innerHTML +=
            '<i style="background:' + basolcolor(categories[i]) + '"></i> ' +
            categories[i].replace("Metaux","Métaux").replace("metalloides","métalloïdes").replace("Element mineraux","Éléments minéraux").replace("incompletes","incomplètes") + '<br>';
    }
    return div;
}
legend.addTo(map); // ajout de la légende à la carte

//déclaration d'une variable filtre0 qui corrspond au bouton "réinitialiser les filtres"
var filtre0 = document.querySelector('.filterbutton');

filtre0.addEventListener('click', function(nofilter) {
    var newGeoJson;
    document.querySelectorAll('select').forEach(function(e) {
        e.value = "";
        console.log(e.value);
        var filtre = e.id.split("-")[1];

        newGeoJson = creerDonnees(data, filtre, "");
        console.log(newGeoJson);
    })
    afficheDonneesCarte(newGeoJson, map);
})

// Script Alerte
var error = document.querySelector('.error');
document.querySelector(".cross").addEventListener('click', function(e) {
    error.style.display = 'none'
    window.location.reload();
});