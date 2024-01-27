# Backend 💻

[![Apollo-GraphQL](https://img.shields.io/badge/-ApolloGraphQL-311C87?style=for-the-badge&logo=apollo-graphql)](https://www.apollographql.com/)[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)[![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)[![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)[![.ENV](https://img.shields.io/badge/.ENV-22272e?style=for-the-badge&logo=.env)](https://github.com/motdotla/dotenv#readme)[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

Our robust backend system seamlessly connects and manages your IoT ecosystem. It efficiently retrieves data from ESP32 devices via MQTT and securely stores it in a database for future analysis and reference.
It also provides a GraphQL API tailored for our mobile application, providing a user-friendly interface to access your data. With user authentication features, it ensures that your data is only accessible to authorised individuals, increasing security and control. This backend is the trusted guardian of your data, providing seamless access, storage and protection for your IoT ecosystem.

## Run locally

### Set environment variables (.env) - example:

```bash
PORT=5555
MONGODB_USER=root
MONGODB_PASSWORD=pass
MONGODB_URI=mongodb://root:pass@127.0.0.1:27017
SECRET_ACCESS_KEY=secret
SECRET_REFRESH_KEY=secret
MQTT_HOST=localhost
MQTT_PORT=8883
MQTT_USERNAME=backend
MQTT_PASSWORD=1234
MQTT_CA='-----BEGIN CERTIFICATE-----
MIIDMzCCAhugAwIBAgIUX99rvLeXX3VI8oY4bWdL/pc08pcwDQYJKoZIhvcNAQEL
BQAwKTETMBEGA1UECwwKaW90X2Jyb2tlcjESMBAGA1UEAwwJbG9jYWxob3N0MB4X
DTIzMTIwMjE2NTUyOFoXDTI4MTIwMTE2NTUyOFowKTETMBEGA1UECwwKaW90X2Jy
b2tlcjESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A
MIIBCgKCAQEAy4Xza6LosS0y+6YarFKe2RdrMZKH5uioLOk2M8HrkGHJgpIZ2tJD
f30LlJqbDUwUxp7dld0GZfL67jWZPsIRDjIBAxhyuc5d3MW5UXRuo135Wa2xu+O8
lAgCAyZ4wMx3shh84imMouXroxxgutCJpJFR/lNK5ScgMSVKX9EhR6a8FFJnfe3M
stEuZTRENwnWs71LB552qD7N8jkugDcqF6Jg/rE1/APFX2OqOuIf1+sE9zrd9qm0
CkZdFDgptya6mSf96VoEz9vf3ufKaSxaqptwdfEjAo3KzgFgT1Au1iLnmBwu7+E4
IqAwMPHtyboZV8HMUNqKoRnJVAbdT9N+NwIDAQABo1MwUTAdBgNVHQ4EFgQUFdol
OpV0SqDOrOpez4NIpI+85VswHwYDVR0jBBgwFoAUFdolOpV0SqDOrOpez4NIpI+8
5VswDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAYNcqxesFqYSa
QpFvB/p8bnpDC4dTsheUb2CGbxsK/q4I52ryZayNW7No9PFWeaDhLh6kWvAfW/6/
wMEbavsjquo0uPeMw0bXya9/gIw74LTMFJh+b80lDc4BPGN+N3OVHajnMsU5SQ6m
Tl+w3a6T8B1R1ZpFGye9pIM0eg5yWinLwjsNnagdpaablTxWWk6hIOvwrikDMz+z
dM7B4aEslcatiPwdPTRz7+WM7/+4ry3WuwXfBgIiZFCELlX7wXTiHZnMPa1b6vkF
qpaMNLNRGK/6MwxiRY27bG/dgB9O8Qg7yHfrQX8p17zsa4WMz26o/rhLYmF6Bx22
hk3PmQbqGg==
-----END CERTIFICATE-----
'
MQTT_CERT='-----BEGIN CERTIFICATE-----
MIICwjCCAaoCFDqIp8Fxa3oD6C5DaqvMC5C1e+nmMA0GCSqGSIb3DQEBCwUAMCkx
EzARBgNVBAsMCmlvdF9icm9rZXIxEjAQBgNVBAMMCWxvY2FsaG9zdDAeFw0yMzEy
MDIxNzEyMjZaFw0yNDAzMTExNzEyMjZaMBIxEDAOBgNVBAMMB2JhY2tlbmQwggEi
MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCdDuIZCCVZln9OGSwHpLgzMxWs
aQthSE8euq1+bWYOcKWSFEsEuN5aMtBRRWdtBgQAHxjvUjJCu1zgg/fG838wUuRk
p1IbNtfGCJn+iP0AvIfBaZMdVdVVVrD0hiYJl2gp0zrJbAnBwMh2+1xBYvGgWXV6
M/b0KnUwR4tT3JmAt6xF3dSg8AW7tQmoFyNKx/5USkFWv0NyIB2WtNqoEGqj+Jb8
VEvuXFuXFO+86k2DF/mpa2pat3IkTusloGeIlJ1+FafliwZ1g4PjvNOQzRlk2Qqe
SvpLUjbbTg4iLB83VGBsdmzF+rxaCz9dmHXWMPOcC+20vvm8raesPvPKxeZHAgMB
AAEwDQYJKoZIhvcNAQELBQADggEBAAJ2l9P1iswDU793+ukJMFf5fqtcsqoYSPs2
2uYA0tiOFn3oI+9sOWihk9UWCN6Nms6NZmbgmk7ceRF35dOKVVGsrPJZdJLGIeVL
Ap+5P1/Tkhb9gYSBn7FZoHqKeHhr0N1al/6/qXyPywQkpkPB3Oyj1TEXajMwZo4x
R8Va+VyD2mqF7C0iSO5gK0k4OsDkfYtBRTiYmKdKRYT/K5UGElqvI8xmBd08aBJs
OEPLlCjiZKauh83evGNfrxSR2GlUo0vI+hizKxHbP5JvrZ8YZQwPxsgSPG9JtqYQ
9uWYWpPpzyavbacSqrdJls7cIcC5uxigMwOVrNzsaH34/RZkkdo=
-----END CERTIFICATE-----
'
MQTT_KEY='-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAnQ7iGQglWZZ/ThksB6S4MzMVrGkLYUhPHrqtfm1mDnClkhRL
BLjeWjLQUUVnbQYEAB8Y71IyQrtc4IP3xvN/MFLkZKdSGzbXxgiZ/oj9ALyHwWmT
HVXVVVaw9IYmCZdoKdM6yWwJwcDIdvtcQWLxoFl1ejP29Cp1MEeLU9yZgLesRd3U
oPAFu7UJqBcjSsf+VEpBVr9DciAdlrTaqBBqo/iW/FRL7lxblxTvvOpNgxf5qWtq
WrdyJE7rJaBniJSdfhWn5YsGdYOD47zTkM0ZZNkKnkr6S1I2204OIiwfN1RgbHZs
xfq8Wgs/XZh11jDznAvttL75vK2nrD7zysXmRwIDAQABAoIBACyArRw+rKan+Eae
51T7HZ6UWQ3TbgAQxyqD5ukuAn8Q+DleOquJ3qdcQp7ktZu02qlWJnCZr9gs0vJj
MnBTSrTcqA7FQoSnk5hvk4MGOfpdcXIigicLzTkzKU0APgL1vfQsADpWvKUEBUmB
i/CTIrg24QzRcKZa6X3Wp+oJVg2cjDc0/eMHsAwysiktuoAhobnWAuccJ6vcCa4U
gNYpGD9vLLxx8XC1n31CEpei9pFixmV9UzvOEgMURWNk8XM03kJAmOtlHLv/buOZ
zqJPBMzr6JVILe0qdBxSb7DxGSGyvhZWjy3yyGFjLLyeglTwDOsq/otzjEhLnUwX
fbm/8PECgYEAyUGmUPw/569zIJX13nmD31kymHDRwmTudwYpucjHApuU7wDvqvy8
D8oUoHyirxYqTcNTKO7wAbk0Tsxj7TJBz6tzy+XVw7PY79lFg/+tzUW9X0pSZBib
JdA57N1f3uDHbgu2PdcDZ1A9cKJHbC8DjxJRC9IW0/oRlS/mZUaQl2MCgYEAx8eE
AniigoT7buBWbklkhPJwSp3CSf3JGz61jE8BviiLod3Mtk16r5/feWJWJWj3maSW
zE9Vw9VcK0Fo92YXAlSsrcMF57ppqcC7DOXThBeZUZgsC7dbCxrQeDzDgpvPwVBI
HeMqhxP00b1lEagG2ZbT3bA6QHOQYzf8VULeZM0CgYEAsXzhNUjQ/v1/NbyqwhI+
V4ntkfzlMGAc4gEgaUUFJWqaNRGJTC1pmS8pc8OXIXwVwNDClTXrmkmANQISGkyZ
N5FIJQjDtbz1U8k0gk3JNGANu2zrLnV41idF/nvZIdDwcD+J8A2gZcug86VaAbGQ
nOuVaCxWj4lZWk2NDcHmoGsCgYAYAwX92gwGTf9+ex5IUS/wvsb6YO3KQOOcD7R4
ccKO3Yay5NrHCpb1ZuzQRR5/jpc780lgsyRmzk0uscTw/2dCk3TRyb/68y/iBFU3
HqSGmuOFqBmbKuWZdxaZbQw+tYWKAaE5XmVtKNvjHbV5Is339yXt3lGSD5HKKx98
C/Z4/QKBgQCp/8Rcpw/yamkRs9wCKYwKfv9SaZUWAsixyCR/z7up8tKS0mNOJtOc
t/aeTW7Ao9QwxEPYw2aPcSmFrtbwniQp+tcfB8DI9BtqQgKYpcLXDWTpS8WHNBQl
ml2s5YaKrN2CFnXOCXUyYTuhW6sCmKnO5oiuOxMYnC92OjxBOmJkgw==
-----END RSA PRIVATE KEY-----
'
```

### Running in Development

```bash
# start MongoDB and Mosquitto 
npm run docker:dev

# start backend
npm run start

# start backend and watch for changes
npm run watch
```

### Running in a production environment

```bash
npm run docker:prod
```

### Lint

```bash
# lint code with ESLint
npm run lint

# try to fix ESLint errors
npm run lint:fix
```

### Test

```bash
# run all tests with jest
npm run test

# run all tests and report coverage information
npm run test:coverage
```

### Validate

```bash
# run lint and tests
npm run validate
```

## Manage users in Mosquitto
:warning: You must be logged into the MQTT container interactively!

### Add new user

```bash
mosquitto_passwd -c /mosquitto/config/password <user-name-to-add>
```

### Delete user

```bash
mosquitto_passwd -D /mosquitto/config/password <user-name-to-delete>
```

### MQTT web client

```bash
docker run -d --name mqttx-web -p 80:80 emqx/mqttx-web
```

## Folder structure

```bash
├── coverage                 # Tests coverage
├── dist                     # Built library
├── mosquitto
│   ├── config               # Mosquitto config
│   ├── data                 # Mosquitto data
│   └── log                  # Mosquitto logs
├── node_modules
├── src                      
│   ├── __generated__        # Types generated by codegen
│   ├── constants            # A list of constants
│   ├── providers            # Contains files responsible for working to external APIs, database, etc.
│   ├── resolvers            # GraphQL resolvers
│   ├── utils                # Contains helper files
│   └── index.ts             # The entry point for the project
├── tests                    # Unit tests for the project
├── .eslintignore            # A list of files to ignore by ESLint
├── .eslintrc.json           # ESLint configuration
├── .gitignore               # A list of files to ignore when pushing to Github
├── codegen.yml              # Generate types from your GraphQL schema 
├── docker-compose.yaml        
├── Dockerfile               
├── jest.config.json         # Jest configuration
├── package-lock.json        
├── package.json
├── README.md                # The readme for the backend
├── schema.graphql           # GraphQL schema 
└── tsconfig.json            # TypeScript configuration
```
