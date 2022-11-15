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
        accountID : instanceJson.accountID,
        accountType : instanceJson.accountType,
        firstName : instanceJson.firstName,
        lastName : instanceJson.lastName,
        status : "Up"
      }
    }).then((entity_instance) => console.log ("Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }
}

exports.instanceName = "accountID";

exports.setDataPlaneReturnProp = "accountID";

exports.getDataPlaneReturnValue = function (instance) {
  min = Math.ceil(100000000);
  max = Math.floor(999999999);
  return (String(Math.floor(Math.random() * (max - min + 1)) + min));
}
