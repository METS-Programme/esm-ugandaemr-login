export interface LocationResponse {
  type: string;
  total: number;
  resourceType: string;
  meta: {
    lastUpdated: string;
  };
  link: Array<{
    relation: string;
    url: string;
  }>;
  id: string;
  entry: Array<LocationEntry>;
}

export interface LocationEntry {
  resource: Resource;
}

export interface Resource {
  id: string;
  name: string;
  resourceType: string;
  status: "active" | "inactive";
  meta?: {
    tag?: Array<{
      code: string;
      display: string;
      system: string;
    }>;
  };
}

export interface ProviderResponse {
  results: Results[];
}

export function hasAttribute(resp?: ProviderResponse): boolean {
  return (
    resp?.results &&
    resp?.results.length > 0 &&
    resp?.results[0].attributes &&
    resp?.results[0].attributes.length > 0
  );
}

export interface Results {
  uuid: string;
  display: string;
  person: Person;
  identifier: string;
  attributes: Attributes[];
  retired: boolean;
  auditInfo: AuditInfo;
  links: Links[];
  resourceVersion: string;
}

export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: string;
  dateChanged: string;
}

export interface Creator {
  uuid: string;
  display: string;
  links: Links[];
}

export interface Attributes {
  display: string;
  uuid: string;
  attributeType: AttributeType;
  value: RoomsResponse;
  voided: boolean;
  links: Links[];
  resourceVersion: string;
}

export interface RoomsResponse {
  uuid: string;
  display: string;
  name: string;
  description: string;
  address1: string;
  address2: string;
  cityVillage: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  countyDistrict: string;
  address3: string;
  address4: string;
  address5: string;
  address6: string;
  tags: Tags[];
  parentLocation: ParentLocation;
  childLocations: ChildLocations[];
  retired: boolean;
  attributes: string[];
  address7: string;
  address8: string;
  address9: string;
  address10: string;
  address11: string;
  address12: string;
  address13: string;
  address14: string;
  address15: string;
  links: Links[];
  resourceVersion: string;
}

export interface ChildLocations {
  uuid: string;
  display: string;
  links: Links[];
}

export interface ParentLocation {
  uuid: string;
  display: string;
  links: Links[];
}

export interface Tags {
  uuid: string;
  display: string;
  links: Links[];
}

export interface AttributeType {
  uuid: string;
  display: string;
  links: Links[];
}

export interface Person {
  uuid: string;
  display: string;
  gender: string;
  age: string;
  birthdate: string;
  birthDateEstimated: boolean;
  dead: boolean;
  deathDate: string;
  causeOfDeath: string;
  preferredName: PreferredName;
  preferredAddress: string;
  attributes: string[];
  voided: boolean;
  birthtime: string;
  deathDateEstimated: boolean;
  links: Links[];
  resourceVersion: string;
}

export interface PreferredName {
  uuid: string;
  display: string;
  links: Links[];
}

export interface Links {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: User;
  locale: string;
  allowedLocales: string[];
  sessionLocation: string;
  currentProvider: CurrentProvider;
}

export interface CurrentProvider {
  uuid: string;
  display: string;
  links: Links[];
}

export interface User {
  uuid: string;
  display: string;
  username: string;
  systemId: string;
  userProperties: UserProperties;
  person: Person;
  privileges: Privileges[];
  roles: Roles[];
  links: Links[];
}

export interface Links {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Roles {
  uuid: string;
  display: string;
  name: string;
}

export interface Privileges {
  uuid: string;
  display: string;
  name: string;
}

export interface Person {
  uuid: string;
  display: string;
}

export interface UserProperties {
  loginAttempts: string;
}