import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '../utils/setup';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A string encoded using base64. */
  Base64String: { input: string; output: string; }
  DateTime: { input: string; output: string; }
  JWT: { input: string; output: string; }
  ObjectID: { input: string; output: string; }
  Timestamp: { input: number; output: number; }
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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  Result: ( AuthResult ) | ( FlowerResult );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AddFlowerInput: AddFlowerInput;
  AuthPayload: ResolverTypeWrapper<AuthPayload>;
  AuthResult: ResolverTypeWrapper<AuthResult>;
  Base64String: ResolverTypeWrapper<Scalars['Base64String']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Data: ResolverTypeWrapper<Data>;
  DataFilterInput: DataFilterInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DateTimeFilter: DateTimeFilter;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Flower: ResolverTypeWrapper<Flower>;
  FlowerEdge: ResolverTypeWrapper<FlowerEdge>;
  FlowerFilterInput: FlowerFilterInput;
  FlowerResult: ResolverTypeWrapper<FlowerResult>;
  FlowerSortFieldEnum: FlowerSortFieldEnum;
  FlowerSortInput: FlowerSortInput;
  Flowers: ResolverTypeWrapper<Flowers>;
  IDFilter: IdFilter;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JWT: ResolverTypeWrapper<Scalars['JWT']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  NameFilterInput: NameFilterInput;
  ObjectID: ResolverTypeWrapper<Scalars['ObjectID']['output']>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<{}>;
  Result: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Result']>;
  Sensor: ResolverTypeWrapper<Sensor>;
  SensorData: ResolverTypeWrapper<SensorData>;
  SensorDataEdge: ResolverTypeWrapper<SensorDataEdge>;
  SensorDataSortFieldEnum: SensorDataSortFieldEnum;
  SensorDataSortInput: SensorDataSortInput;
  SensorInput: SensorInput;
  SensorTypeEnum: SensorTypeEnum;
  SortOrderEnum: SortOrderEnum;
  StatusEnum: StatusEnum;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']['output']>;
  UpdateFlowerInput: UpdateFlowerInput;
  User: ResolverTypeWrapper<User>;
  ValidRange: ResolverTypeWrapper<ValidRange>;
  ValidRangeInput: ValidRangeInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AddFlowerInput: AddFlowerInput;
  AuthPayload: AuthPayload;
  AuthResult: AuthResult;
  Base64String: Scalars['Base64String']['output'];
  Boolean: Scalars['Boolean']['output'];
  Data: Data;
  DataFilterInput: DataFilterInput;
  DateTime: Scalars['DateTime']['output'];
  DateTimeFilter: DateTimeFilter;
  Float: Scalars['Float']['output'];
  Flower: Flower;
  FlowerEdge: FlowerEdge;
  FlowerFilterInput: FlowerFilterInput;
  FlowerResult: FlowerResult;
  FlowerSortInput: FlowerSortInput;
  Flowers: Flowers;
  IDFilter: IdFilter;
  Int: Scalars['Int']['output'];
  JWT: Scalars['JWT']['output'];
  Mutation: {};
  NameFilterInput: NameFilterInput;
  ObjectID: Scalars['ObjectID']['output'];
  PageInfo: PageInfo;
  Query: {};
  Result: ResolversInterfaceTypes<ResolversParentTypes>['Result'];
  Sensor: Sensor;
  SensorData: SensorData;
  SensorDataEdge: SensorDataEdge;
  SensorDataSortInput: SensorDataSortInput;
  SensorInput: SensorInput;
  String: Scalars['String']['output'];
  Subscription: {};
  Timestamp: Scalars['Timestamp']['output'];
  UpdateFlowerInput: UpdateFlowerInput;
  User: User;
  ValidRange: ValidRange;
  ValidRangeInput: ValidRangeInput;
}>;

export type AuthDirectiveArgs = { };

export type AuthDirectiveResolver<Result, Parent, ContextType = Context, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type LengthDirectiveArgs = {
  max?: Maybe<Scalars['Int']['input']>;
  min?: Maybe<Scalars['Int']['input']>;
};

export type LengthDirectiveResolver<Result, Parent, ContextType = Context, Args = LengthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type NotEmptyDirectiveArgs = { };

export type NotEmptyDirectiveResolver<Result, Parent, ContextType = Context, Args = NotEmptyDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type NotNullDirectiveArgs = { };

export type NotNullDirectiveResolver<Result, Parent, ContextType = Context, Args = NotNullDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type RangeDirectiveArgs = {
  max?: Maybe<Scalars['Int']['input']>;
  min?: Maybe<Scalars['Int']['input']>;
};

export type RangeDirectiveResolver<Result, Parent, ContextType = Context, Args = RangeDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AuthPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = ResolversObject<{
  accessToken?: Resolver<ResolversTypes['JWT'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['JWT'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AuthResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AuthResult'] = ResolversParentTypes['AuthResult']> = ResolversObject<{
  data?: Resolver<Maybe<ResolversTypes['AuthPayload']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['StatusEnum'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface Base64StringScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Base64String'], any> {
  name: 'Base64String';
}

export type DataResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Data'] = ResolversParentTypes['Data']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['SensorDataEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type FlowerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Flower'] = ResolversParentTypes['Flower']> = ResolversObject<{
  humidity?: Resolver<ResolversTypes['Sensor'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ObjectID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  temperature?: Resolver<ResolversTypes['Sensor'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FlowerEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FlowerEdge'] = ResolversParentTypes['FlowerEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['Base64String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Flower'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FlowerResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FlowerResult'] = ResolversParentTypes['FlowerResult']> = ResolversObject<{
  data?: Resolver<Maybe<ResolversTypes['Flower']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['StatusEnum'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FlowersResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Flowers'] = ResolversParentTypes['Flowers']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['FlowerEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface JwtScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JWT'], any> {
  name: 'JWT';
}

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addFlower?: Resolver<ResolversTypes['FlowerResult'], ParentType, ContextType, RequireFields<MutationAddFlowerArgs, 'input'>>;
  login?: Resolver<ResolversTypes['AuthResult'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  refresh?: Resolver<ResolversTypes['AuthResult'], ParentType, ContextType, RequireFields<MutationRefreshArgs, 'token'>>;
  removeFlower?: Resolver<ResolversTypes['FlowerResult'], ParentType, ContextType, RequireFields<MutationRemoveFlowerArgs, 'id'>>;
  signUp?: Resolver<ResolversTypes['AuthResult'], ParentType, ContextType, RequireFields<MutationSignUpArgs, 'email' | 'name' | 'password'>>;
  updateFlower?: Resolver<ResolversTypes['FlowerResult'], ParentType, ContextType, RequireFields<MutationUpdateFlowerArgs, 'id' | 'input'>>;
}>;

export interface ObjectIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ObjectID'], any> {
  name: 'ObjectID';
}

export type PageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<ResolversTypes['Base64String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['Base64String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  flower?: Resolver<ResolversTypes['Flower'], ParentType, ContextType, RequireFields<QueryFlowerArgs, 'id'>>;
  flowers?: Resolver<ResolversTypes['Flowers'], ParentType, ContextType, Partial<QueryFlowersArgs>>;
  sensor?: Resolver<ResolversTypes['Sensor'], ParentType, ContextType, RequireFields<QuerySensorArgs, 'id'>>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type ResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Result'] = ResolversParentTypes['Result']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthResult' | 'FlowerResult', ParentType, ContextType>;
  status?: Resolver<ResolversTypes['StatusEnum'], ParentType, ContextType>;
}>;

export type SensorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Sensor'] = ResolversParentTypes['Sensor']> = ResolversObject<{
  data?: Resolver<ResolversTypes['Data'], ParentType, ContextType, Partial<SensorDataArgs>>;
  frequency?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ObjectID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['SensorTypeEnum'], ParentType, ContextType>;
  validRange?: Resolver<ResolversTypes['ValidRange'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SensorDataResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SensorData'] = ResolversParentTypes['SensorData']> = ResolversObject<{
  dateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ObjectID'], ParentType, ContextType>;
  numericValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  rawValue?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SensorDataEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SensorDataEdge'] = ResolversParentTypes['SensorDataEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['Base64String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['SensorData'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  latestSensorData?: SubscriptionResolver<ResolversTypes['SensorData'], "latestSensorData", ParentType, ContextType, RequireFields<SubscriptionLatestSensorDataArgs, 'id'>>;
}>;

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ObjectID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ValidRangeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ValidRange'] = ResolversParentTypes['ValidRange']> = ResolversObject<{
  max?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  min?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  AuthResult?: AuthResultResolvers<ContextType>;
  Base64String?: GraphQLScalarType;
  Data?: DataResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Flower?: FlowerResolvers<ContextType>;
  FlowerEdge?: FlowerEdgeResolvers<ContextType>;
  FlowerResult?: FlowerResultResolvers<ContextType>;
  Flowers?: FlowersResolvers<ContextType>;
  JWT?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  ObjectID?: GraphQLScalarType;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Result?: ResultResolvers<ContextType>;
  Sensor?: SensorResolvers<ContextType>;
  SensorData?: SensorDataResolvers<ContextType>;
  SensorDataEdge?: SensorDataEdgeResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Timestamp?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  ValidRange?: ValidRangeResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = Context> = ResolversObject<{
  auth?: AuthDirectiveResolver<any, any, ContextType>;
  length?: LengthDirectiveResolver<any, any, ContextType>;
  notEmpty?: NotEmptyDirectiveResolver<any, any, ContextType>;
  notNull?: NotNullDirectiveResolver<any, any, ContextType>;
  range?: RangeDirectiveResolver<any, any, ContextType>;
}>;
