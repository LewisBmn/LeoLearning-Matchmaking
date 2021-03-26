/*Types des variables d'entrée :
 - Liste des cours proposés dans la semaine 
        ID Tuteur
        Matière préférée
        Date
        Heure
        Matières possibles pour ce cours (pas nécessaire si on a carrément une instance du tuteur)
        Nombre maximal de participants 
        ID du cours proposé
 - Liste des demandes de cours faites pour toute la semaine
        Date
        Heure
        ID Tutoré
        Matière demandée 
        priorité (ou nb de demandes + nb d'acceptations + nb d'absences)
        ID du cours demandé
 - Booléan pour savoir si la semaine est une semaine spéciale

Types des variables de sortie : 
 - Liste des cours validés 
        Date
        Heure
        ID Tuteur
        Liste des ID des tutorés
        Matrière
 (- Nb de priorités satisfaites (ou pourcentage de remplissage))
*/
//#region definition tutorés
var lewis={
       nom:"Baumann",
       prenom:"Lewis",
       id:1,
       nbDemandes:4,
       nbAcceptation:1,
       nbAbsences:0,
       annee:1
};
var gaelle={
       nom:"Rigaud",
       prenom:"Gaëlle",
       id:2,
       nbDemandes:4,
       nbAcceptation:0,
       nbAbsences:0,
       annee:2
};
var ferdinand={
       nom:"Keller",
       prenom:"Ferdinand",
       id:3,
       nbDemandes:8,
       nbAcceptation:5,
       nbAbsences:1,
       annee:3
};
var yvann={
       nom:"Vincent",
       prenom:"Yvann",
       id:4,
       nbDemandes:9,
       nbAcceptation:7,
       nbAbsences:0,
       annee:1
};
var romane={
       nom:"Moison",
       prenom:"Romane",
       id:5,
       nbDemandes:12,
       nbAcceptation:4,
       nbAbsences:1,
       annee:2
};
var tom={
       nom:"Payet",
       prenom:"Tom",
       id:6,
       nbDemandes:4,
       nbAcceptation:0,
       nbAbsences:0,
       annee:3
};

//#endregion
//#region definition tuteurs
var clement={
       nom:"Lajoux",
       prenom:"Clément",
       id:1,
       liste_matieres_pref:["Mécanique des fluides (A3)", "Mécanique des fluides (A2)", "Thermodynamique (A2)", "Espaces vectoriels (A1)"]
};
var vincent={
       nom:"Debande",
       prenom:"Vincent",
       id:2,
       liste_matieres_pref:["Calcul Différentiel (A2)", "Calcul Intégral (A2)", "Fonctions et suites numériques (A2)"]
};
var louise={
       nom:"Jousselin",
       prenom:"Louise",
       id:3,
       liste_matieres_pref:["Calcul Différentiel (A2)", "Calcul Intégral (A2)", "Fonctions et suites numériques (A2)"]
};
var quentin={
       nom:"Normand",
       prenom:"Quentin",
       id:4,
       liste_matieres_pref:["Calcul Différentiel (A2)", "Calcul Intégral (A2)", "Fonctions et suites numériques (A2)"]
};
//#endregion
var listesCours = [[1, clement, "28/03/2021", "18:00", 4], [2, louise, "29/03/2021", "09:00", 1], [3, vincent, "28/03/2021", "18:00", 3], [4, quentin, "30/03/2021", "16:00", 7]]; 
//de la forme [idcours, tuteur, date, heure, nbplaces]
var listeDemandes = [[1, lewis, "Espaces Vectoriels (A1)"], [1, gaelle, "Mécanique des fluides (A2)"], [1, tom, "Espaces Vectoriels (A1)"], [2, yvann, "Informatique Fondamentale (A1)"], [2, tom, "Informatique Fondamentale (A1)"]]
//de la forme [idcours, tutoré, matière demandée]


function CalculerLaPriorite(tutore){
       return tutore.nbDemandes - tutore.nbAcceptation - 2*tutore.nbAbsences;

       //L'ajout de priorité dans le cas d'une semaine spéciale se fera directement lors de la création du cours. 
}
function CalculPossibilités(listeCours, listeDemandes){
       var listeFinale = []; //Cette liste est de la forme [[cours, [tableau des tutorés assistant au cours]], ...]
       for(var i = 0; i<listeCours.length; i++){
              var listeDemandesCours = [];
              listeDemandes.forEach(element => { //Pour chaque cours proposé, on réunit les demandes pour ce cours dans un tableau
                     if(element[0]==listeCours[i][0]){
                            listeDemandesCours.push(element);
                     }
              });
              if(listeDemandesCours != null && listeDemandesCours.length > 0){
                     var listeParCours = [];
                     var demandesCours = [];
                     listeDemandesCours.forEach(element => {
                            if(demandesCours.indexOf(element[2])==-1){
                                   listeParCours.push(DeterToutesDemandesSimilaires(listeDemandesCours, element[2])); //On réunit les demandes par matière demandée
                                   demandesCours.push(element[2]);
                            }
                     });
                     listeParCours.sort(SortByScore); //On trie la liste en fonction de la matière la plus demandée
                     /*
                     listeParCours.forEach(element => {
                            element.forEach(el => console.log(el[1].prenom))
                     })*/
                     listeParCours.forEach(element => element.sort(SortByScoreTutoré)); //On trie les tutorés par ordre décroissant de score au sein de chaque matière demandée
                     listeTutorésCours = [];
                     for(var j = 0; j<listeCours[i][4]; j++){
                            if(listeParCours[0][j] != null && listeParCours[0][j] != undefined){
                                   listeTutorésCours.push(listeParCours[0][j]);
                            }
                     }
                     var liste = [listeCours[i], listeTutorésCours];
                     listeFinale.push(liste);
              }
       }
       listeFinale.forEach(element => {
              console.log(element[0][1].prenom + " " + element[0][1].nom + " : cours de " + element[1][0][2] + " le " + element[0][2] + " à " + element[0][3]);
              element[1].forEach(elem => {
                     console.log("        - " + elem[1].prenom + " " + elem[1].nom);
              })
       })
}

function SortByScore(elem1, elem2){
       var score1 = 0;
       var score2 = 0;
       elem1.forEach(elem => {
              score1+=CalculerLaPriorite(elem[1]);
       });
       elem2.forEach(elem => {
              score2+=CalculerLaPriorite(elem[1]);
       });
       if(score1<score2){
               return 1;
       }
       if(score2<score1) {
              return -1;
       }
       return 0;
}
function SortByScoreTutoré(tut1, tut2){
       if(CalculerLaPriorite(tut1[1])>CalculerLaPriorite(tut2[1])){return -1;}
       if(CalculerLaPriorite(tut1[1])<CalculerLaPriorite(tut2[1])){return 1;}
       return 0;
}
function DeterToutesDemandesSimilaires(liste, cours){
       var listeSimilaire = [];
       liste.forEach(element => {
              if(element[2]==cours){
                     listeSimilaire.push(element);
              }
       });
       return listeSimilaire;
}
CalculPossibilités(listesCours, listeDemandes);


/*
function TriBulles(tab){ 
       //Tri à bulles à adapter en fonction des besoin. 
       var change = true
       do {
              change = false ;
              for(var i = 0; i <= tab.length-1; i++){
                     if(tab[i] > tab[i+1]){
                            tem = tab[i+1];
                            tab[i+1] = tab[i] ;
                            tab[i] = tem ;
                            change = true;
                     }
              }
       } while(change)
}
*/

