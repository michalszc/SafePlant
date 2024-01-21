export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  AccountNumber: { input: any; output: any; }
  Base64String: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Byte: { input: any; output: any; }
  CountryCode: { input: any; output: any; }
  Cuid: { input: any; output: any; }
  Currency: { input: any; output: any; }
  DID: { input: any; output: any; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  DateTimeISO: { input: any; output: any; }
  DeweyDecimal: { input: any; output: any; }
  Duration: { input: any; output: any; }
  EmailAddress: { input: any; output: any; }
  GUID: { input: any; output: any; }
  HSL: { input: any; output: any; }
  HSLA: { input: any; output: any; }
  HexColorCode: { input: any; output: any; }
  Hexadecimal: { input: any; output: any; }
  IBAN: { input: any; output: any; }
  IP: { input: any; output: any; }
  IPCPatent: { input: any; output: any; }
  IPv4: { input: any; output: any; }
  IPv6: { input: any; output: any; }
  ISBN: { input: any; output: any; }
  ISO8601Duration: { input: any; output: any; }
  JSON: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
  JWT: { input: any; output: any; }
  LCCSubclass: { input: any; output: any; }
  Latitude: { input: any; output: any; }
  LocalDate: { input: any; output: any; }
  LocalDateTime: { input: any; output: any; }
  LocalEndTime: { input: any; output: any; }
  LocalTime: { input: any; output: any; }
  Locale: { input: any; output: any; }
  Long: { input: any; output: any; }
  Longitude: { input: any; output: any; }
  MAC: { input: any; output: any; }
  NegativeFloat: { input: any; output: any; }
  NegativeInt: { input: any; output: any; }
  NonEmptyString: { input: any; output: any; }
  NonNegativeFloat: { input: any; output: any; }
  NonNegativeInt: { input: any; output: any; }
  NonPositiveFloat: { input: any; output: any; }
  NonPositiveInt: { input: any; output: any; }
  ObjectID: { input: any; output: any; }
  PhoneNumber: { input: any; output: any; }
  Port: { input: any; output: any; }
  PositiveFloat: { input: any; output: any; }
  PositiveInt: { input: any; output: any; }
  PostalCode: { input: any; output: any; }
  RGB: { input: any; output: any; }
  RGBA: { input: any; output: any; }
  RoutingNumber: { input: any; output: any; }
  SafeInt: { input: any; output: any; }
  SemVer: { input: any; output: any; }
  Time: { input: any; output: any; }
  TimeZone: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
  URL: { input: any; output: any; }
  USCurrency: { input: any; output: any; }
  UUID: { input: any; output: any; }
  UnsignedFloat: { input: any; output: any; }
  UnsignedInt: { input: any; output: any; }
  UtcOffset: { input: any; output: any; }
  Void: { input: any; output: any; }
};

export type AddFlowerInput = {
  /** Sensor input for humidity. */
  humidity: SensorInput;
  /** Name of the flower to be added. */
  name: Scalars['String']['input'];
  /** Sensor input for temperature. */
  temperature: SensorInput;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  /** Access token for authentication. */
  accessToken: Scalars['JWT']['output'];
  /** Refresh token for authentication. */
  refreshToken: Scalars['JWT']['output'];
  /** User associated with the authentication. */
  user: User;
};

export type AuthResult = Result & {
  __typename?: 'AuthResult';
  /** Result data containing an authentication payload. */
  data?: Maybe<AuthPayload>;
  /** Status of the result. */
  status: StatusEnum;
};

export type Data = {
  __typename?: 'Data';
  /** A list of sensor data edges. */
  edges: Array<SensorDataEdge>;
  /** Information about pagination. */
  pageInfo: PageInfo;
};

export type DataFilterInput = {
  /** Filter based on date-time ranges. */
  dateTime?: InputMaybe<DateTimeFilter>;
  /** Filter for ID-based criteria. */
  id?: InputMaybe<IdFilter>;
};

export type DateTimeFilter = {
  /** Filters for date-time greater than the specified value. */
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  /** Filters for date-time greater than or equal to the specified value. */
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  /** Filters for date-time less than the specified value. */
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  /** Filters for date-time less than or equal to the specified value. */
  lte?: InputMaybe<Scalars['DateTime']['input']>;
};

export type Flower = {
  __typename?: 'Flower';
  /** Humidity sensor for the flower. */
  humidity: Sensor;
  /** Unique identifier for the flower. */
  id: Scalars['ObjectID']['output'];
  /** Name of the flower. */
  name: Scalars['String']['output'];
  /** Temperature sensor for the flower. */
  temperature: Sensor;
};

export type FlowerEdge = {
  __typename?: 'FlowerEdge';
  /** A cursor for pagination purposes. */
  cursor: Scalars['Base64String']['output'];
  /** The actual flower. */
  node: Flower;
};

export type FlowerFilterInput = {
  /** Filter for ID-based criteria. */
  id?: InputMaybe<IdFilter>;
  /** Filter for filtering flowers by name. */
  name?: InputMaybe<NameFilterInput>;
};

export type FlowerResult = Result & {
  __typename?: 'FlowerResult';
  /** Result data containing a flower. */
  data?: Maybe<Flower>;
  /** Status of the result. */
  status: StatusEnum;
};

export enum FlowerSortFieldEnum {
  /** Sort by ID */
  Id = 'ID',
  /** Sort by name */
  Name = 'NAME'
}

export type FlowerSortInput = {
  /** Specify the field to sort by */
  field: FlowerSortFieldEnum;
  /** Specify the sorting order */
  order: SortOrderEnum;
};

export type Flowers = {
  __typename?: 'Flowers';
  /** A list of flower edges. */
  edges: Array<FlowerEdge>;
  /** Information about pagination. */
  pageInfo: PageInfo;
};

export type IdFilter = {
  /** Filter for ObjectID equality (equal to) */
  eq?: InputMaybe<Scalars['ObjectID']['input']>;
  /** Filter for inclusion in a list of ObjectIDs */
  in?: InputMaybe<Array<Scalars['ObjectID']['input']>>;
  /** Filter for ObjectID inequality (not equal to) */
  ne?: InputMaybe<Scalars['ObjectID']['input']>;
  /** Filter for exclusion from a list of ObjectIDs */
  nin?: InputMaybe<Array<Scalars['ObjectID']['input']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Add a flower and return the result. */
  addFlower: FlowerResult;
  /** Authenticate and return the result. */
  login: AuthResult;
  /** Refresh an access token and return the result. */
  refresh: AuthResult;
  /** Remove a flower and return the result. */
  removeFlower: FlowerResult;
  /** Sign up a new user and return the result. */
  signUp: AuthResult;
  /** Update a flower and return the result. */
  updateFlower: FlowerResult;
};


export type MutationAddFlowerArgs = {
  input: AddFlowerInput;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRefreshArgs = {
  token: Scalars['JWT']['input'];
};


export type MutationRemoveFlowerArgs = {
  id: Scalars['ObjectID']['input'];
};


export type MutationSignUpArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationUpdateFlowerArgs = {
  id: Scalars['ObjectID']['input'];
  input: UpdateFlowerInput;
};

export type NameFilterInput = {
  /** Filter for names that contain a specific substring. */
  contains?: InputMaybe<Scalars['String']['input']>;
  /** Filter for equality (equal to) on names. */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Filter for inequality (not equal to) on names. */
  ne?: InputMaybe<Scalars['String']['input']>;
  /** Filter for names that start with a specific substring. */
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  /** The cursor marking the end of the current set. */
  endCursor?: Maybe<Scalars['Base64String']['output']>;
  /** Indicates if there are more pages after the current set. */
  hasNextPage: Scalars['Boolean']['output'];
  /** Indicates if there are more pages before the current set. */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor marking the start of the current set. */
  startCursor?: Maybe<Scalars['Base64String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  /** Retrieve a specific flower by ID. */
  flower: Flower;
  /** Retrieve a list of flowers. */
  flowers: Flowers;
  /** Retrieve a specific sensor by ID. */
  sensor: Sensor;
  /** Retrieve user data */
  user: User;
};


export type QueryFlowerArgs = {
  id: Scalars['ObjectID']['input'];
};


export type QueryFlowersArgs = {
  after?: InputMaybe<Scalars['Base64String']['input']>;
  before?: InputMaybe<Scalars['Base64String']['input']>;
  filter?: InputMaybe<FlowerFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<FlowerSortInput>;
};


export type QuerySensorArgs = {
  id: Scalars['ObjectID']['input'];
};

export type Result = {
  /** Status of the result (OK or ERROR). */
  status: StatusEnum;
};

export type Sensor = {
  __typename?: 'Sensor';
  /** Retrieve sensor data with optional filtering. */
  data: Data;
  /** Number of seconds how often data is collected. */
  frequency: Scalars['Int']['output'];
  /** Unique identifier for the sensor. */
  id: Scalars['ObjectID']['output'];
  /** Type of sensor (Temperature or Humidity). */
  type: SensorTypeEnum;
  /** Valid data range for the sensor. */
  validRange: ValidRange;
};


export type SensorDataArgs = {
  after?: InputMaybe<Scalars['Base64String']['input']>;
  before?: InputMaybe<Scalars['Base64String']['input']>;
  filter?: InputMaybe<DataFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<SensorDataSortInput>;
};

export type SensorData = {
  __typename?: 'SensorData';
  /** Date and time when data was collected. */
  dateTime: Scalars['DateTime']['output'];
  /** Unique identifier for sensor data. */
  id: Scalars['ObjectID']['output'];
  /** Numeric value of the sensor data. */
  numericValue: Scalars['Float']['output'];
  /** Raw sensor data value as a string. */
  rawValue: Scalars['String']['output'];
  /** Unix timestamp of data collection. */
  timestamp: Scalars['Timestamp']['output'];
};

export type SensorDataEdge = {
  __typename?: 'SensorDataEdge';
  /** A cursor for pagination purposes. */
  cursor: Scalars['Base64String']['output'];
  /** The actual sensor data. */
  node: SensorData;
};

export enum SensorDataSortFieldEnum {
  /** Sort by date-time */
  Datetime = 'DATETIME',
  /** Sort by timestamp */
  Timestamp = 'TIMESTAMP',
  /** Sort by value */
  Value = 'VALUE'
}

export type SensorDataSortInput = {
  /** Specify the field to sort by */
  field: SensorDataSortFieldEnum;
  /** Specify the sorting order */
  order: SortOrderEnum;
};

export type SensorInput = {
  /** Frequency of data collection in seconds. */
  frequency: Scalars['Int']['input'];
  /** Valid data range for the sensor. */
  validRange: ValidRangeInput;
};

export enum SensorTypeEnum {
  /** Humidity sensor type */
  Humidity = 'HUMIDITY',
  /** Temperature sensor type */
  Temperature = 'TEMPERATURE'
}

export enum SortOrderEnum {
  /** Sort in ascending order */
  Asc = 'ASC',
  /** Sort in descending order */
  Desc = 'DESC'
}

export enum StatusEnum {
  /** Status indicating an error. */
  Error = 'ERROR',
  /** Status indicating success. */
  Ok = 'OK'
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to the latest sensor data for a specific sensor. */
  latestSensorData: SensorData;
};


export type SubscriptionLatestSensorDataArgs = {
  id: Scalars['ObjectID']['input'];
};

export type UpdateFlowerInput = {
  /** Updated sensor input for humidity. */
  humidity?: InputMaybe<SensorInput>;
  /** Updated name of the flower. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Updated sensor input for temperature. */
  temperature?: InputMaybe<SensorInput>;
};

export type User = {
  __typename?: 'User';
  /** Email of the user. */
  email: Scalars['String']['output'];
  /** Unique identifier for the user. */
  id: Scalars['ObjectID']['output'];
  /** Name of the user. */
  name: Scalars['String']['output'];
};

export type ValidRange = {
  __typename?: 'ValidRange';
  /** Maximum valid range value */
  max: Scalars['Float']['output'];
  /** Minimum valid range value */
  min: Scalars['Float']['output'];
};

export type ValidRangeInput = {
  /** Maximum valid range value. */
  max: Scalars['Float']['input'];
  /** Minimum valid range value. */
  min: Scalars['Float']['input'];
};
