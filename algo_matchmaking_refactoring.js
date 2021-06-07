/*
Types des variables d'entrée :
       - une liste des cours de la forme [[idcours, tuteur, date, heure, nbplaces], [idcours, tuteur, date, heure, nbplaces], ...], ou tuteur est un objet de la forme {nom, prenom, id, liste_matieres_préférées}
                                            int,    tuteur,  str,  str,   int                                                                                           str,   str,  int,     str[]

       - une liste des demandes de la forme [[idcours, tutoré, matière demandée], [idcours, tutoré, matière demandée], ...], ou tutoré est un objet de la forme {nom, prenom, id, nbDemandes, nbAcceptations, nbAbsences, annee} (l'idcours doit correspondre à l'idcours d'un cours présent dans la liste des cours)
                                                int,   tutoré,   str                                                                                             str,  str,   int,   int,      int,             int,       int

       - une liste des matières prioritaires (lors d'une semaine de cc par ex.) de la forme [Matiere1, Matiere2, ...] avec Matierei le nom de la i-ème matière (str) (l'ordre des matières n'a pas d'importance)

       /!\ Pour le bon fonctionnement de l'algorithme, il est crucial d'être parfaitement cohérent dans le nom des matières : un seul espace en trop fera disfonctionner l'algorithme
*/
/*
Type de la variable de sortie :
       - une liste des cours assignés de la forme [[cours, [tutorés], matière], [cours, [tutorés], matière], ...], ou cours est un élément de la liste des cours, [tutorés] est un tableau de tutoré et matière est le nom de la matière (str)
*/

module.exports = {
       algo: Algorithme
};

var listeMatieresSemaineSpeciale;
var coeffPenalisationAbsences = 2; // Coefficient qui multiplie le nombre d'absences lors du calcul de la priorité d'un tutoré
var coeffFavMtrPrio = 10; // Coefficient de favorisation des matières faisant partie de la liste de matières prioritaires
var coeffPoidsDuNombre = 1; // Coefficient qui va plus ou moins favoriser les cours en fonction du nombre de tutorés.

/// Calcule le score d'un seul tutoré en fonction de son nombre de demandes, d'absences à un cours et de participations
function CalculerLaPriorite(tutore) {
    return tutore.nbDemandes - tutore.nbAcceptation - coeffPenalisationAbsences*tutore.nbAbsences;
}
/// Calcule la priorité d'un cours, en prenant en compte la priorité de la matière, le score individuel des tutorés ainsi que leur nombre
function CalculerLaPrioriteCours(config) {
       /*Cette fonction prend en entrée une possibilité de cours (de la forme [cours, [tutorés], matière]) et un 
       booléen. Elle retourne un entier correspondant à la priorité totale du cours. */
       var prioriteTotale = 0;
       if(listeMatieresSemaineSpeciale.indexOf(config[2])!=-1) { //Si la matière du cours est une matière prioritaire
              prioriteTotale += coeffFavMtrPrio; //On favorise les matières qui sont prioritaires
       }
       for(var i = 0; i<config[1].length; i++) { //On parcourt la liste des tutorés assignés à ce cours
              prioriteTotale += CalculerLaPriorite(config[1][i]) + coeffPoidsDuNombre;
       }
       return prioriteTotale;
}
/// Mélange le tableau passé en paramètre selon l'algorithme de Fisher-Yates
function Shuffle(tab) {

       var i, j, tmp;
       for (i = tab.length - 1; i > 0; i--) {
              j = Math.floor(Math.random() * (i + 1));
              tmp = tab[i];
              tab[i] = tab[j];
              tab[j] = tmp;
    }
    return tab;
}
/// Permet d'obtenir les différentes informations relatives à un cours à partir de son identifiant
function GetCourseWithID(id, listeCours) {

       for(var i = 0; i<listeCours.length; i++) {

              if(id==listeCours[i][0]) return listeCours[i];
       }
}
/// Supprime les demandes conflictuelles (demandes faites le même jour à la même heure par le même tutoré)
function ConflictSolver(demande, listeDemandes, listeCours) {

       var listeSuppr = [];
       var len = listeCours.length;
       var coursDem = GetCourseWithID(demande[0], listeCours);

       for(var i = 0; i<listeDemandes.length; i++) {

              var coursLis = GetCourseWithID(listeDemandes[i][0], listeCours);
              if(listeDemandes[i] == demande || listeDemandes[i][1] != demande[1] || coursDem[2] != coursLis[2] || coursDem[3] != coursLis[3]) { //On élimine les demandes qui comportent le même tutoré et la même date/heure
                     
                     listeSuppr.push(listeDemandes[i]);
              }
       }
       return listeSuppr;
}
/// Récupère toutes les demandes associées à un cours
function GetAllRegistrationsForACourse(cours, listeDemandes) {

       var id = cours[0];
       var registrations = [];
       for(var i = 0; i<listeDemandes.length; i++){
              if(listeDemandes[i][0] == id){registrations.push(listeDemandes[i]);} //Si l'id du cours demandé correspond à celui du cours passé en paramètre, on push
       }
       return registrations;
}
/// Génère une configuration de cours aléatoire
function GetRandomConfigurationForACourse(cours, listeInscriptionsAuCours) {

       var nbPlaces = cours[4];
       var config = [];
       var howMany = 0; //compte du nombre de tutorés déjà placés dans le cours 

       listeInscriptionsAuCours = Shuffle(listeInscriptionsAuCours); //On mélange la liste
       var matiere = listeInscriptionsAuCours[0][2];

       config.push(listeInscriptionsAuCours[0][1]); //On prend comme référentiel le premier tutoré de la liste mélangée
       howMany++;

       for(var j = 1; j<listeInscriptionsAuCours.length; j++) {

              if(listeInscriptionsAuCours[j][2] == matiere && howMany < nbPlaces) { //Si la demande concerne la même matière que celle du tutoré référentiel
                     config.push(listeInscriptionsAuCours[j][1]);
                     howMany++;
              }
       }

       return [cours, config, matiere]
}
/// Détermine la meilleure configuration pour un cours
function GetBestConfigurationForACourse(cours, listeDemandes) {

       var registrations = GetAllRegistrationsForACourse(cours, listeDemandes); // On récupère la liste de toutes les demandes
       var len = registrations.length*registrations.length*registrations.length; // Dans l'idéal on aurait le factoriel de la taille pour pouvoir explorer toutes les possibilités
       var configs = [];
       var scores = [];

       for(var i = 0; i<len; i++) {
              var config = GetRandomConfigurationForACourse(cours, registrations); // On génère le maximum de configurations aléatoires possibles, pour pouvoir ensuite déterminer la meilleure
              configs.push(config); 
              scores.push(CalculerLaPrioriteCours(config));
       }

       for(var i = 0; i<len; i++) { // Tri par insertion sur les configurations, pour avoir la meilleure en premier
              var tempConfig = configs[i];
              var tempScore = scores[i];
              
              var j = i - 1;
              while(j > -1 && tempScore > scores[j]) {

                     scores[j+1] = scores[j];
                     configs[j+1] = configs[j];
                     
                     j--;
              }

              scores[j+1] = tempScore;
              configs[j+1] = tempConfig;
       } 

       var finalIndex = IsThereAnotherBestConfiguration(configs, scores);
       return configs[finalIndex];
}
/// Tranche entre plusieurs configurations lorsqu'elles ont le même score, en fonction de la matière préférée des tuteurs
function IsThereAnotherBestConfiguration(configs, scores) {

       var bestConfigs = [configs[0]];
       var stop = false;
       var bestConfig = configs[0];
       var bestScore = scores[0];
       var bestConfigIndex = 0;

       var i = 1;
       while(i<configs.length && !stop) {

              if(scores[i] == bestScore) { // Si un autre configuration a le même score que la meilleure configuration, on l'append dans une liste

                     bestConfigs.push(configs[i]);
                     i++;
              }
              else { // Sinon, on stop la boucle, car la liste des scores est triée par ordre décroissant, donc nous sommes sûrs qu'aucune autre configuration n'a le meilleur score

                     stop = true;
              }
       }

       if(i > 1) { //S'il y a plusieurs configurations avec le meilleur score
              
              var listBestTutorScores = [];
              for(var i = 0; i<bestConfigs.length; i++) {

                     var score = 0;
                     var config = bestConfigs[i];

                     for(var j = 0; j<config.length; j++) { // On parcourt chaque cours de la configuration étudiée

                            var cours = config[j];
                            var matiere = cours[2]; 
                            if(cours[1] != null) { // Pour éviter un crash intempestif, on vérifie que le tuteur n'est pas null

                                   score += RetourneIndicePreferenceMatiere(matiere, cours[1].liste_matieres_pref);
                            }
                     } 

                     listBestTutorScores.push(score);
              }

              bestConfigIndex = GetMin(listBestTutorScores); //On prend la configuration avec le plus faible score (donc la configuration avec les matières préférées par les tuteurs)
       }

       return bestConfigIndex;
}
/// Retourne l’index du plus petit élément de la liste
function GetMin(liste) {

       var indexMin = 0;
       for(var i = 0; i<liste.length; i++) {
              if(liste[i] < liste[indexMin]) {

                     indexMin = i;
              }   
       }

       return indexMin;
}
/// Retourne le rang de la matière dans la liste des préférences du tuteur. Si la matière n'est pas dans la liste, renvoie un indice égal à la longueur de la liste. 
function RetourneIndicePreferenceMatiere(nomMatiere, listeMatieresPrefTuteur) {

       var ind = 0;
       if(listeMatieresPrefTuteur != null) {
              while (ind<listeMatieresPrefTuteur.length) {
                     if(listeMatieresPrefTuteur[ind] == nomMatiere) {

                            break;
                     }
                     
                     ind++;
              }
       }
       return ind;
}
/// Fonction principale
function Algorithme(listeCours, listeDemandes, listeMatieresSpeciale) {

       listeMatieresSemaineSpeciale = listeMatieresSpeciale // On affecte à la variable globale la valeur passée en paramètre

       for(var i = 0; i<listeDemandes.length; i++) { // On élimine toutes les demandes conflictuelles

              listeDemandes = ConflictSolver(listeDemandes[i], listeDemandes, listeCours);
       }

       var tabFinal = [];

       for(var i = 0; i<listeCours.length; i++) { // Pour chaque cours de la liste de cours, on détermine la meilleure configuration

              tabFinal.push(GetBestConfigurationForACourse(listeCours[i], listeDemandes));
       }

       return tabFinal;
}
