exports.getOrgIDFromOrgName =async function (
  orgName: String, nile: nileAPI): Promise< string | null > {

  // Check if organization exists
  var myOrgs = await nile.organizations.listOrganizations()
  var maybeOrg = myOrgs.find( org => org.name == orgName)
  if (maybeOrg) {
    return maybeOrg.id
  } else {
    return null
  }
}
