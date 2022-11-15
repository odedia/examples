exports.addInstanceToOrg = async function (nile, orgID, entityName, instanceJson) {

  // Check if entity instance already exists, create if not
  let myInstances = await nile.entities.listInstances({
    org: orgID,
    type: entityName,
  });
  let maybeInstance = myInstances.find( instance => instance.type == entityName && instance.properties[exports.instanceName] == instanceJson[exports.instanceName] );
  if (maybeInstance) {
    console.log("Entity instance " + entityName + ` exists where ` + exports.instanceName + ` is ${instanceJson[exports.instanceName]} (id: ${maybeInstance.id})`);
  } else {
    console.log(myInstances);
    await nile.entities.createInstance({
      org: orgID,
      type: entityName,
      body: {
        name : instanceJson.name,
        type : instanceJson.type,
        datasetDB : "server-" + instanceJson.name + ":3306",
        cloud : instanceJson.cloud,
        status : "Up"
      }
    }).then((entity_instance) => console.log ("Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }
}

exports.instanceName = "name";

exports.setDataPlaneReturnProp = "datasetDB";

exports.getDataPlaneReturnValue = function (instance) {
  min = Math.ceil(100);
  max = Math.floor(999);
  return (String("server-" + Math.floor(Math.random() * (max - min + 1)) + min) + ":3306");
}
