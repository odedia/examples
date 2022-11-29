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
        name : instanceJson.name,
        src_type: instanceJson.src_type,
        src_bootstrapServers: instanceJson.src_bootstrapServers,
        src_apiKey: instanceJson.src_apiKey,
        src_apiSecret: instanceJson.src_apiSecret,
        src_topic: instanceJson.src_topic,
        src_dataformat: instanceJson.src_dataformat,
        dst_type: instanceJson.dst_type,
        dst_url: instanceJson.dst_url,
        dst_user: instanceJson.dst_user,
        dst_key: instanceJson.dst_key,
        dst_db: instanceJson.dst_db,
        dst_schema: instanceJson.dst_schema,
        secrets_url: instanceJson.secrets_url,
        job : instanceJson.job,
        status : "Up"
      }
    }).then((entity_instance) => console.log ("Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }
}

exports.instanceName = "name";

exports.setDataPlaneReturnProp = "job";

exports.getDataPlaneReturnValue = function (instance) {
  min = Math.ceil(100);
  max = Math.floor(999);
  return (String("job-" + Math.floor(Math.random() * (max - min + 1)) + min));
}
