# Commands

The `and-cli` is built upon our team's best practices for setting up projects.

## copy

Cross-platform wrapper of file and directory copying. See [shelljs cp command](https://github.com/shelljs/shelljs#cpoptions-source_array-dest) for additional options for the `--flags` argument.

### Commands
* `and-cli copy --source path/to/existing/file.txt --destination path/to/destination/folder` - Copy file to destination folder
* `and-cli copy --source path/to/existingfolder --destination path/to/destination/folder --flags "-r"` - Copy file to destination folder recursively

## deploy

Collection of deployment sub-commands to manage a variety of application types.

### AWS Commands
Amazon provides a variety of command-line tools to interact with their services. Below are general system and project configuration requirements to run them via `and-cli`

System requirements:
- [Python 3.7+](https://www.python.org/ftp/python/3.7.4/python-3.7.4-amd64.exe)
    - Ensure configured in your PATH
- Configure AWS IAM User account
    - Log into AWS console
    - Click Username dropdown > My Security Credentials > Users
    - Click `Add User`
        - Add User name `{project}-{environment}` (ie. andculture-working)
        - Select `Programmatic Access` and `AWS Management Console access`
    - Click `Next: Permissions
    - Click `Attach existing policies directly`
        - `AWSElasticBeanstalkFullAccess`
        - Any other policies necessary

Project requirements:
- Add new AWS EB profile to your `~/.aws/config` file
    ```
    [profile your-name]
    aws_access_key_id = YOUR_ACCESS_KEY_ID
    aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
    ```


### AWS Beanstalk Usage
- Ensure general AWS system/project requirements are met
- Ensure your IAM User has the `AWSElasticBeanstalkFullAccess` security policy enabled
- Perform initial EB setup in project repository in desired git branch
    - `$: eb init --profile {YOUR_PROFILE_NAME}`
    - Or for an existing application update your `.elasticbeanstalk/config` file
        ```
        global:
            profile: {YOUR_PROFILE_NAME}
        ```
- Setup AWS beanstalk manifest
    - dotnet
        - Create `dotnet/aws-windows-deployment-manifest.json`. Example...
            ```json
            {
                "manifestVersion": 1,
                "deployments": {
                    "aspNetCoreWeb": [
                        {
                            "name": "my-application",
                            "parameters": {
                                "appBundle": "release.zip",
                                "iisPath": "/",
                                "iisWebSite": "Default Web Site"
                            }
                        }
                    ]
                }
            }
            ```
- Configure application's entry point
    - dotnet
       - Configure a `web.config` with your aspnet core assembly
            ```xml
            <?xml version="1.0" encoding="utf-8"?>
                <configuration>
                <system.webServer>
                    <handlers>
                    <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModule" resourceType="Unspecified" />
                    </handlers>
                    <aspNetCore processPath="dotnet" arguments=".\Web.dll" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout" forwardWindowsAuthToken="false" />
                </system.webServer>
            </configuration>
            ```

##### Commands
* `and-cli deploy aws-beanstalk --dotnet` - Deploy dotnet core application to AWS beanstalk
    * Optionally pass `--timeout <number>` to set the timeout in minutes, defaults to 20.
    * Optionally pass `--verbose` to stream events from the Elastic Beanstalk log.


### AWS S3 Usage
- Ensure general AWS system/project requirements are met
- Ensure your IAM User has the `AWSS3FullAccess` security policy enabled

##### Commands
* `and-cli deploy aws-s3 --webpack --destination my-bucket/folder/name --profile {YOUR_PROFILE_NAME}`
    * Copies webpack build artifacts from `frontend/build` and deploys them to `--destination`
    * Optionally pass `--publish` flag to perform webpack build as a part of the call
    * `--profile` argument specifies IAM profile with permissions to S3.

### Azure Commands

Azure has a number of CLI commands for managing resources on their service. In order to utilize these commands, you can either use a service principal with a secret to deploy to your Azure resources (recommended), or you can user the credentials for an Azure account directly.

It is recommended that Azure Active Directory is utilized to deploy resources, as this allows fine-grained access to only the resources related to your project. However, this is not required, and you are able to deploy resources using credentials for an Azure account with appropriate access (with some exceptions).

Setting up Azure AD:
- Configure Azure AD Service Principal
    - Log into Azure Portal
    - Navigate to your Azure Active Directory
    - Navigate to the App Registrations section
    - Click New Registration
        - Add name `{project}-{environment}` (ie. andculture-working)
        - Click Register
        - You should get re-directed to the dashboard for the new app registration. If not, navigate to the App Registrations section and click on the newly created App Registration.
        - Take note of the `Application (client) ID` and `Directory (tenant) ID` as you will need these later.
    - Navigate to the Certificates & Secrets section
    - Click New client secret.
        - Select an expiration date, if applicable.
        - Take note of the `Value` of the newcly created secret, as you will need this later.

Project requirements (if using Azure AD):
- For each resource in your application, do the following:
    - Navigate to the dashboard of the resource
    - Navigate to Access control (IAM)
    - Click Add in the Add a role assignment section
        - Select the appropriate role
        - Search for the app registration you have created for this project
        - Click Save

#### Commands

## dotnet

### Usage

While the sdk will _eventually_ locate your solution file `.sln`. Placing your solution file in one of the following locations is recommended for the
best performance.

1. Root `*.sln`
2. Child of dotnet folder `dotnet/*.sln`
3. Grandchild of dotnet folder `dotnet/*/*.sln`
4. Anywhere else `**/*.sln`

### Commands

* `and-cli dotnet` - Runs the dotnet solution's web project
    * `and-cli dotnet -b, --build` - Builds the solution
    * `and-cli dotnet -c, --clean` - Cleans the solution
    * `and-cli dotnet -- --cli my command` - Runs commands through a project's custom dotnet cli project
    * `and-cli dotnet -R, --restore` - Restores NuGet packages for the solution
    * `and-cli dotnet -r, --run` - Runs the dotnet solution's web project (default)
    * `and-cli dotnet -w, --watch` - Runs the solution and reloads on changes
* `and-cli dotnet-test` - Run automated tests for the solution
    * `and-cli dotnet-test --filter <filter>` - Runs automated tests that match the provided filter text

---

## install

The `and-cli` itself requires some minor setup and these commands hopefully ease that lift.

### Commands

* `and-cli install` - Configures global npm package, project-specific `and-cli` alias and the developer `and-cli-dev` alias

---

## migration

This command wraps the functionality provided by the dotnet ef tool for common Entity Framework interactions, such as creating a new migration, applying the migration, or deleting an existing migration.

### Commands

* `and-cli migration --add <migration name>` - Creates a new entity framework migration based on changes from the last context snapshot.
* `and-cli migration --run <migration name>` - Applies (or reverts) an entity framework migration based on the current database.
* `and-cli migration --delete` - Removes files for the most recent migration, which cannot be applied to the database. If already applied, you need to revert to a previous migration first.

## github

Various commands to interact with github andculture related resources.

### Commands

* `and-cli github` - Lists master AndcultureCode repositories
* `and-cli github -u|--username <username>` - Lists master AndcultureCode repositories as well as those for the supplied github username

## nuget

While the dotnet core cli provides some nuget commands, the process start to finish is less than ideal. These commands aim to make that simple.

### Commands

* `and-cli nuget --publish <version>` - Updates, packs and publishes dotnet core 'packable' projects to NuGet

---

## webpack

Starts webpack built projects located in our team's conventional 'frontend' folder by way of the `npm run start` command.

### Commands

* `and-cli webpack` - Starts webpack development server configured in the 'frontend' folder.
* `and-cli webpack -c -R` - Optionally cleans and restores npm packages before running the frontend application.
* `and-cli webpack-test` - Starts interactive frontend tests via `npm run test` in 'frontend' folder
* `and-cli webpack-test -c -R` - Optionally cleans and restores npm packages before running test suite
* `and-cli webpack-test --ci` - Optionally runs frontend tests synchronously for use in continous integration