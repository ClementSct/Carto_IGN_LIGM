// POUR LE CHARGEMENT DES OBJETS CONTENUS DANS LE FICHIER GEOJSON
//sélectionner les objets de la table
var loadedData = {};
var dptParRegion = { "": {} };
var communeParRegion = { "": {} };
var communeParDpt = { "": {} };
var entreprisesParRegion = { "": {} };
var entreprisesParDpt = { "": {} };
var entreprisesParCommune = { "": {} };
var pollutionParRegion = { "": {} };
var pollutionParDpt = { "": {} };
var pollutionParCommune = { "": {} };
var entrepriseParPollution = { "": {} };



document.addEventListener('DOMContentLoaded', () => {
    const regions = document.querySelector('#filtre-region');
    const departements = document.getElementById('filtre-dpt');
    const communes = document.getElementById('filtreCommune');
    //
    const pollution = document.getElementById('filtrePollution');
    const entreprise = document.getElementById('filtreEntreprise');

    var descriptions = {}

    fetch('./data/BASOL.json').then(Response => {
        return Response.json();
    }).then(data => {
        data.sites.forEach(function(e) {
            descriptions[e.num_basol] = e.caracterisation.description;
        });

        // on appelle le fichier geojson contenant les données
        fetch('./data/basol_pollution.geojson').then(Response => {
            return Response.json();
        }).then(data => {

              
            // variables de sortie
            let outputregion = "";
            let outputdepartement = "";
            let outputcommune = "";
            //
            let outputpollution = "";
            let outputentreprise = "";

            // on initiale des listes vides
            var ensRegion = {};
            var ensDepartement = {};
            var ensCommune = {};
            //
            var ensPollution = {};
            var ensEntreprise = {};

            //selectionne les éléments du geojson
            var elements = data.features

            // TESTS :
            elements.forEach(element => {

            })


            // Récupére les regions/departements/communes et les ajoute dans des listes
            elements.forEach(element => {
                ensRegion[element.properties.region] = 0
                ensDepartement[element.properties.dpt] = 0
                ensCommune[element.properties.commune] = 0
                ensPollution[element.properties.nom_classe] = 0
                ensEntreprise[element.properties.nom_site] = 0

                if (element.properties.nom_classe != "Non renseigné") {
                    element.properties.nom_classe.forEach(function(e) {
                        ensPollution[e] = 0
                    })
                }
                
                //Chargement du département dans la bonne région
                //Ajout de la région si elle n'est pas dans dptParRegion
                if (!(element.properties.region in dptParRegion)) {
                    dptParRegion[element.properties.region] = {}
                }
                //Mise à jour de la liste de départements 
                dptParRegion[element.properties.region][element.properties.dpt] = 0
                dptParRegion[""][element.properties.dpt] = 0

                if (!(element.properties.dpt in communeParDpt)) {
                    communeParDpt[element.properties.dpt] = {}
                }
                //Mise à jour de la liste de départements 
                communeParDpt[element.properties.dpt][element.properties.commune] = 0
                communeParDpt[""][element.properties.commune] = 0
               
                // POLLUANTS
                // Mise à jour de la liste des types de polluant par région
                if (!(element.properties.region in pollutionParRegion)) {
                    pollutionParRegion[element.properties.region] = {};
                }

                pollutionParRegion[element.properties.region][element.properties.nom_classe] = 0;
                pollutionParRegion[""][element.properties.nom_classe] = 0;                 

                // Mise à jour de la liste des types de polluant par département
                if (!(element.properties.dpt in pollutionParDpt)) {
                    pollutionParDpt[element.properties.dpt] = {};
                }

                pollutionParDpt[element.properties.dpt][element.properties.nom_classe] = 0;
                pollutionParDpt[""][element.properties.nom_classe] = 0;    

                // Mise à jour de la liste des types de polluant par commune
                if (!(element.properties.commune in pollutionParCommune)) {
                    pollutionParCommune[element.properties.commune] = {};
                }

                pollutionParCommune[element.properties.commune][element.properties.nom_classe] = 0;
                pollutionParCommune[""][element.properties.nom_classe] = 0;    

                // ENTREPRISES
                // Mise à jour de la liste des entreprises par région      
                if (!(element.properties.region in entreprisesParRegion)) {
                    entreprisesParRegion[element.properties.region] = {};
                }

                entreprisesParRegion[element.properties.region][element.properties.nom_site] = 0;
                entreprisesParRegion[""][element.properties.nom_site] = 0;

                // Mise à jour de la liste des entreprises par département   
                if (!(element.properties.dpt in entreprisesParDpt)) {
                    entreprisesParDpt[element.properties.dpt] = {};
                }

                entreprisesParDpt[element.properties.dpt][element.properties.nom_site] = 0;
                entreprisesParDpt[""][element.properties.nom_site] = 0;

                // Mise à jour de la liste des entreprises par commune   
                if (!(element.properties.commune in entreprisesParCommune)) {
                    entreprisesParCommune[element.properties.commune] = {};
                }

                entreprisesParCommune[element.properties.commune][element.properties.nom_site] = 0;
                entreprisesParCommune[""][element.properties.nom_site] = 0;

                // Mise à jour de la liste des entreprises par pollution   
                if (!(element.properties.nom_classe in entrepriseParPollution)) {
                    entrepriseParPollution[element.properties.nom_classe] = {};
                }

                entrepriseParPollution[element.properties.nom_classe][element.properties.nom_site] = 0;
                entrepriseParPollution[""][element.properties.nom_site] = 0;

                // DESCRIPTION
                //Chargement de la description complète au lieu de l'abrégée
                element.properties.descrip = descriptions[element.properties.id]

            });

            // tri par ordre alphabétique et nombre
            var listRegion = Object.keys(ensRegion).sort();
            var listDepartement = Object.keys(ensDepartement).sort();
            var listCommune = Object.keys(ensCommune).sort();
            var listPollution = Object.keys(ensPollution).sort();
            var listentreprise = Object.keys(ensEntreprise).sort();

            //Rend les élément unique au sein des liste et les rajoute dans l'html, pour les régions
            listRegion.forEach(el => {
                outputregion += "<option>" + el + "</option>";
            });
            // pour les départements
            listDepartement.forEach(el => {
                outputdepartement += "<option>" + el + "</option>";
            });
            // pour les communes
            listCommune.forEach(el => {
                outputcommune += "<option>" + el + "</option>";
            });
            
            // pour les types de pollutions

            let typesDePollution = new Set();

            listPollution.forEach(el => {
                if (el == "Aucun" || el == "Informations incompletes" || el == "Non renseigné") {
                    // Ajoutez "Informations manquantes" s'il n'est pas déjà présent
                    if (!typesDePollution.has("Informations manquantes")) {
                        typesDePollution.add("Informations manquantes");
                    }
                }
                if (el == "Chimique" || el == "Micropolluants organiques" || el == "Metaux et metalloides" || el == "Phytosanitaires" || el == "Element mineraux" || el == "Pharmaceutiques et hormones" || el == "Informations manquantes") {
                    typesDePollution.add(el);
                }
                
            });
            typesDePollution.forEach(el => {
                outputpollution += "<option>" + el + "</option>";
            });
            // pour le nom des entreprises
            listentreprise.forEach(el => {
                outputentreprise += "<option>" + el + "</option>";
            });

            //appel des objets dans la liste déroulante
            // on envoie dans l'html les listes de données distinctes dans les menus déroulants
            regions.innerHTML += outputregion;
            departements.innerHTML += outputdepartement;
            communes.innerHTML += outputcommune;
            //
            pollution.innerHTML += outputpollution;
            entreprise.innerHTML += outputentreprise;

        }).catch(err => {
            console.log(err);
        })
    })
});