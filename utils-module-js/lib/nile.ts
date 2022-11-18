import Nile, { NileApi } from "@theniledev/js";

var emoji = require('node-emoji');

export const loginAsDev = async function (
  url: string, workspace: string, email: string, password: string, token: string): Promise<NileApi> {

  if (!token) {
    if (!email || !password) {
      console.error(emoji.get('x'), `Error: please provide NILE_WORKSPACE_ACCESS_TOKEN or {NILE_DEVELOPER_EMAIL and NILE_DEVELOPER_PASSWORD} in .env .  See .env.defaults for more info and copy it to .env with your values`);
      process.exit(1);
    }
  }

  const instance = await Nile({
    basePath: url,
    workspace: workspace,
  }).connect(token ?? { email: email, password: password});
  console.log(emoji.get('arrow_right'), ` Connected into Nile as developer`);
  //console.log(`export NILE_ACCESS_TOKEN=${nile.authToken}`);

  return instance;
}

export const loginAsUser = async function(
  nile: NileApi,
  email: string, 
  password: string): Promise<NileApi> {

  // Login user
  await nile.users.loginUser({
    loginInfo: {
      email: email,
      password: password,
    },
    }).catch((error:any) => {
      console.error(emoji.get('x'), `Error: Failed to login to Nile as user ${email}: ` + error.message);
      process.exit(1);
    });

  // Get the JWT token
  nile.authToken = nile.users.authToken;
  console.log(emoji.get('arrow_right'), ` Logged into Nile as user ${email}`);
  //console.log(`export NILE_ACCESS_TOKEN=${nile.authToken}`);

  return nile;
}

export const maybeCreateUser = async function (
  nile: NileApi, email: string, password: string, role: string) {

  // Check if user exists, create if not
  try {
    await nile.users.loginUser({
      loginInfo: {
        email: email,
        password: password,
      },
      });
    console.log(emoji.get('dart'), "User with email " + email + " already exists");
  } catch {
    await nile.users.createUser({
      createUserRequest : {
        email : email,
        password : password,
        metadata : { "role": role }
      }
    }).then ( (usr) => {
      if (usr != null)
        console.log(emoji.get('white_check_mark'), "Created User: " + usr.email);
    }).catch((error:any) => {
      console.error(error);
      process.exit(1);
    })
  }
}

export const maybeCreateOrg = async function (
  nile: NileApi, orgName: String, createIfNot: boolean): Promise< string | undefined> {

  // Check if organization exists
  var myOrgs = await nile.organizations.listOrganizations();
  var maybeOrg = myOrgs.find( org => org.name == orgName);
  if (maybeOrg) {
    console.log(emoji.get('dart'), "Org " + orgName + " exists with id " + maybeOrg.id);
    //console.log(`export NILE_ORGANIZATION_ID=${maybeOrg.id}`);
    return maybeOrg.id;
  } else if (createIfNot == true) {
    var orgID;
    await nile.organizations.createOrganization({"createOrganizationRequest" :
    {
      name: orgName,
    }}).then ( (org) => {
      if (org != null) {
        orgID = org.id;
        console.log(emoji.get('white_check_mark'), "Created new org " + org.name + " with orgID " + orgID);
      }
    }).catch((error:any) => {
      if (error.message == "org already exists") {
        console.log("Org with name " + orgName + " already exists but cannot get ID");
        process.exit(1);
      } else {
        console.error(error);
        process.exit(1);
      }
    })
    return(orgID);
  } 
}

export const maybeAddUserToOrg = async function (
  nile: NileApi, email: String, orgID: string) {

  // Check if user already exists in the org, add if not
  var myUsers = await nile.organizations.listUsersInOrg({
      org: orgID
  });

  if (myUsers.find( user => user.email==email)) {
      console.log(emoji.get('dart'), "User " + email + " exists in org " + orgID);
  } else {
    // Add user to organization
    const body = {
      org: orgID,
      addUserToOrgRequest: {
        email: email,
      },
    };
    nile.organizations
      .addUserToOrg(body)
      .then((data) => {
        console.log(emoji.get('white_check_mark'), `Added tenant ${email} to orgID ${orgID}`);
      }).catch((error:any) => {
        if (error.message.startsWith('User is already in org')) {
          console.log(emoji.get('dart'), `User ${email} already exists in orgID ${orgID}`);
        } else {
          console.error(error)
          process.exit(1);
        }
      });
  }
}

export const getAdminForOrg = function (
  admins: string, orgID: string) {

  for (let index = 0; index < admins.length ; index++) {
    let org = admins[index].org;
    if (org === orgID) {
      return admins[index];
    }
  }
  return null;
}

export const getAnyValidInstance = async function (
  nile: NileApi, entityType: string): Promise<void | [string, string]>  {

  // Get first org ID
  const users = await import(`../../usecases/${entityType}/init/users.json`);
  // Load first user only
  const index=0
  const orgName = users[index].org;
  let createIfNot = false;
  let orgID = await this.maybeCreateOrg (nile, orgName, false);
  if (!orgID) {
    console.error(emoji.get('x'), `Error: could not get orgID for organization name ${orgName}.  Did you first run 'yarn setup-nile'?`);
    process.exit(1);
  }

  // Get one instance ID for above org ID
  var oneInstance;
  nile.entities.listInstances({
      type: entityType,
      org: orgID,
    }).then((data) => {
      oneInstance = data[0].id;
    });
  if (!oneInstance) {
    console.error(emoji.get('x'), `Could not identify one instance in org ${orgName} (${orgID}). Did you run 'yarn setup-nile'? Please troubleshoot`);
    process.exit(1);
  } else {
    console.log(emoji.get('dart'), `Using instance ID ${oneInstance}`);
    return [oneInstance, orgID];
  }

}
