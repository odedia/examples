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
    console.log(`Did not find existing instance of ${instanceJson[exports.instanceName]} in ${orgID}, creating new instance...`);
    await nile.entities.createInstance({
      org: orgID,
      type: entityName,
      body: {
        campaignName : instanceJson.campaignName,
        targetPage : instanceJson.targetPage,
        generatedQRCode : `https://qrcode.tec-it.com/API/QRCode?data=name%3d${encodeURIComponent(instanceJson.targetPage)}`,
        status : "Up"
      }
    }).then((entity_instance) => console.log ("Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }
}

exports.instanceName = "campaignName";

exports.setDataPlaneReturnProp = "generatedQRCode";

exports.getDataPlaneReturnValue = function (instance) {
  const targetPageEncoded = encodeURIComponent(instance.properties.targetPage);
  return `https://qrcode.tec-it.com/API/QRCode?data=name%3d${targetPageEncoded}`;
}
