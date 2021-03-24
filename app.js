const { MongoClient, ObjectId } = require("mongodb");
// Connection URI
const uri =
  "mongodb+srv://lewisbmn:PBY3sTGqh%23R5R4g%24@clusterleoalgo.kq8uy.mongodb.net/test?retryWrites=true&w=majority";
connect();

async function connect(){
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("test");
    console.log("Connected to database " + db.databaseName)

    const test = db.collection("test");
    const module = db.collection("Module");
    const demandePart = db.collection("DemandeParticipation");  //On enregistre les informations des collections dans des variables
    const proposition = db.collection("PropositionCours");

    const tableTest = await test.find({}).toArray();
    const tableModule = await module.find({}).toArray();
    const tableDemandes = await demandePart.find({}).toArray(); //On transforme ces informations en array afin de pouvoir les manipuler

    var listeMatieres = await demandePart.distinct("cours_id"); //On obtient tous les cours demandés dans la collection demandeParticipation
    var dict = {};
    var demandes = await demandePart.find({}).toArray();
    var valDemandes = [];

    for(var i = 0; i<demandes.length; i++)
    {
      var tutore = await test.find({_id: ObjectId(demandes[i].tutore_id)}).toArray(); //On récupère le tutoré et la matière associée à chaque instance de demandeParticipation
      var matiere = await module.find({_id:ObjectId(demandes[i].cours_id)}).toArray();
      valDemandes.push([tutore[0], matiere[0], tutore[0].nb_demandes - tutore[0].nb_cours_assistes - 2*tutore[0].nb_absences + matiere[0].coefficient_priorite]); //valDemandes contient : [tutoré, matière, scoredemande]
    }
    
    for(var i = 0; i<listeMatieres.length; i++)
    {
      var tab = 0;
      valDemandes.forEach(r => {if(r[1]._id == ObjectId(listeMatieres[i]).toString()){tab += r[2]}});  //On trie les demandes par ordre décroissant pour chaque module
      dict[listeMatieres[i]] = tab; //On créé un dictionnaire de la forme [cours : score du cours]
    }
    for(var i = 0; i<listeMatieres.length; i++)
    {
      var mod = await module.find({_id: ObjectId(listeMatieres[i])}).toArray()
      console.log(i + "    " + mod[0].nom + "    " + dict[listeMatieres[i]])
    }
    var max = RecupMax(dict);
    //console.log(max);
    //var matiereSelectionnee = Object.keys(dict)[0]; //On choisi la matière avec le plus haut score 
    //console.log(matiereSelectionnee);
    var demandesMatiere = await demandePart.find({cours_id:max}).toArray(); //On récupère toutes les demandes associées à la matière sélectionnée
    for(var i = 0; i<demandesMatiere.length; i++) //On trie les demandes par ordre décroissant selon le score de priorité des tutorés
    {
      for(var j = 0; j<demandesMatiere.length-1; j++)
      {
        var tut1 = await test.find({_id:ObjectId(demandesMatiere[j].tutore_id)}).toArray();
        var tut2 = await test.find({_id:ObjectId(demandesMatiere[j+1].tutore_id)}).toArray();
        if(tut1[0].nb_demandes - tut1[0].nb_cours_assistes - 2*tut1[0].nb_absences<tut2[0].nb_demandes - tut2[0].nb_cours_assistes - 2*tut2[0].nb_absences){
          var tampon = demandesMatiere[j];
          demandesMatiere[j] = demandesMatiere[j+1];
          demandesMatiere[j+1] = tampon;
        }      
      }
    }

    var nbPlaces = await proposition.find({_id:ObjectId(demandesMatiere[0].propositioncours_id)}).toArray(); //On récupère le nombre de places associée à la proposition de cours 
    var tableauTutoresFinaux = [];
    for(var i = 0; i<nbPlaces[0].nb_places; i++)
    {
      var tut = await test.find({_id : ObjectId(demandesMatiere[i].tutore_id)}).toArray()
      tableauTutoresFinaux.push(tut[0]);
    }
    tableauTutoresFinaux.forEach(r=>console.log(r));
  }
  catch (ex){
    console.error("Something bad happend " + ex);
  }
  finally{
    client.close();
  }
}

/*function compareDemandes(dem1, dem2){
  var comparison = 0;
  var tut1 = await test.find({_id:ObjectId(dem1.tutore_id)}).toArray();
  var tut2 = await test.find({_id:ObjectId(dem2.tutore_id)}).toArray();
  console.log(tut1);
  return comparison;
}*/
function RecupMax(dict){ //Détermine la clé de l'élement maximal
  var tampon = 0;
  for(var key in dict)
  {
    //console.log(dict[key] + " ici");
    if(dict[key]>tampon){
      //console.log("la " + dict[key]);
      tampon = key;
      //console.log(tampon);
    }
  }
  return tampon;
}
