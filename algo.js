/*Types des variables d'éentrée :
 - Liste des cours proposés dans la semaine 
        ID Tuteur
        Matière préférée
        Date
        Heure
        Matières possibles pour ce cours (pas nécéssaire si on a carrément une instance du tuteur)
        Nombre maximal de participants 
 - Liste des demandes de cours faites pour toute la semaine
        Date
        Heure
        ID Tutoré
        Matière demandée 
        priorité (ou nb de demandes + nb d'acceptations + nb d'absences)
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

function CalculerLaPriorite(tutore){
    priorite = tutore.nbDemandes - tutores.nbAcceptation - tutore.nbAbsences
    /*L'ajout de priorité dans le cas d'une semaine spéciale se fera directement lors de la création du cours. */
}

function TriBulles(tab){ 
       /*Tri à bulles à adapter en fonction des besoin. */
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
