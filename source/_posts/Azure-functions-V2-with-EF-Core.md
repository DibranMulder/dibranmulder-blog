---
title: Azure functions V2 with EF Core
tags: >-
  Azure, Entity Framework Core, EF Core, Migrations, VSTS, Functions V2,
  Dependency Injection.
date: 2018-08-23 15:48:30
---

Last week I was trying to build an API on top of Azure Functions with a SQL databse. This sounds like a pretty easy task however that was not the case, here's my story.

Normally when I use a SQL database in a WebApp, and therefore also functions, I use an ORM mapper. I'm familiar with Entity Framework so thats what I tried. You might think why don't you use [Triggers and Bindings]((https://docs.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings) to connect with your SQL database? Well SQL binding and triggers aren't supported yet.

If you wan't to use Entity Framework inside Azure Functions V2 then you would have to use Entity Framework Core(EF Core) because EF core runs on .NET Core which supports .NET Standard 2.0, and .NET Standard 2.0 is the target for Azure Function v2 projects.

## Installation
Well that having said I chose to have a separate class library for my EF Core database context to live in because I have multiple function apps inside my solution which all have to use that same database context.

EF core requires some Nuget packages, at the time of writing I use the 2.1.2 versions of the understanding packages. The `Design` package is required when you want to work with migrations, if your not planning to do that then forget about that package. The `SqlServer` package has actually a pretty cool story. It is possible to use [other underlying databases](https://docs.microsoft.com/en-us/ef/core/providers/) such as CosmosDb, MySql or what have you. 

```
Microsoft.EntityFrameworkCore
Microsoft.EntityFrameworkCore.Design
Microsoft.EntityFrameworkCore.SqlServer
```

Do not install the following packages.
```
Microsoft.EntityFrameworkCore.Tools
Microsoft.EntityFrameworkCore.Tools.DotNet
```
Those packages got [deprecated after .Net core 2.1.3](https://docs.microsoft.com/en-us/ef/core/miscellaneous/cli/dotnet). Make sure you have downloaded the latest .NET Core SDK. To check your local version execute:
```
> dotnet --version
2.1.400
```
## Setting up the context
Just like with the traditional EF you have to setup a DbContext with all the tables and models and stuff. Generally EF core is simular to EF but there are some differences. A good site with alot of documentation is: https://www.learnentityframeworkcore.com/
```csharp
public class MyContext : DbContext
{
    public MyContext(DbContextOptions<MyContext> dbContextOptions) : base(dbContextOptions)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
    }

    public DbSet<Order> Orders { get; set; }

    public DbSet<Client> Clients { get; set; }
    
    ...
}
```
## Azure Functions V2 Dependency injection
After setting up your DbContext you probably want to use it in your Azure Functions. In order for you to effectively do that you have to setup proper dependency injection. Sadly this is not yet supported out of the box in Azure Functions so you'll have to build it your own. Don't be sad 

I have found a pretty good implementation on [Github](https://github.com/BorisWilhelms/azure-function-dependency-injection). Once you have a project with that code you can just reference that project from your Azure Functions project or just create a Nuget package.

All you then have to do it setup a ServiceProvider and add your dependencies simular to what you would have done in ASP.net core for instance. Note that the package `Microsoft.EntityFrameworkCore` contains a `AddDbContext` method that is build for EF Core contexts.
```csharp
public class ServiceProviderBuilder : IServiceProviderBuilder
{
    public IServiceProvider BuildServiceProvider()
    {
        IConfigurationRoot config = new ConfigurationBuilder()
            .SetBasePath(Environment.CurrentDirectory)
            .AddJsonFile("local.settings.json", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = config.GetConnectionString("SqlConnectionString");

        var services = new ServiceCollection();

        services.AddSingleton<IDemoService, DemoService>();

        services.AddDbContext<MyContext>(options => options.UseSqlServer(connectionString));

        return services.BuildServiceProvider(true);
    }
}
```
Once you've setup the registration then its very easy to inject it into your Azure Functions, take a look at this sample:
```csharp
public static class DemoFunction
{
    [FunctionName(DemoFunction)]
    public static async Task<IActionResult> Run(
        [HttpTrigger(
            AuthorizationLevel.Anonymous,
            "get",
            Route = "demo/route/{id}")]HttpRequestMessage req,
        [Inject] MyContext myContext,
        string id,
        ILogger log)
    {
        var order = myContext.Orders.FirstOrDefault(x => x.Id == id);
        order.Paid = true;
        await mspContext.SaveChangesAsync();
    }
}
```

## Migrations
So we've got a DbContext setup and injected it into our Azure Functions, the next thing what you probably want to do is to use Migrations. EF core comes with great command line tooling, remember when we were using the Package Manager console to execute some Powershell? Finally those days are over. With the new `dotnet ef` tooling you can just do it from the command line.

There is no such thing as `Enable-Migations` anymore, you just add a Migration and you've enabled it. The command to add a migrations is: `dotnet ef migrations add <name>`.

Remember that I created a Shared Class Library with target .NET Standard? Well If you get the following error you've done the same as me. 
```
> dotnet ef migrations add InitialCreate

Startup project 'Allego.Msp.Shared.csproj' targets framework '.NETStandard'. There is no runtime associated with this framework, and projects targeting it cannot be executed directly. To use the Entity Framework Core .NET Command-line Tools with this project, add an executable project targeting .NET Core or .NET Framework that references this project, and set it as the startup project using --startup-project; or, update this project to cross-target .NET Core or .NET Framework.
```
An easy workaround is to enable multiple TargetFrameworks, note that its plural, add an 's' after TargetFramework. If you add a netcoreapp version that your class lib can execute on its own, even without a `static void main()` or something like that.
```xml
<Project Sdk="Microsoft.NET.Sdk">

    <PropertyGroup>
        <TargetFrameworks>netcoreapp2.0.7;netstandard2.0</TargetFrameworks>
    </PropertyGroup>

    ...

</Project>
```
If you execute the `dotnet ef migrations add <name>` again then you will probably get the following error.
```
> dotnet ef migrations add InitialCreate

Unable to create an object of type 'MyContext'. Add an implementation of 'IDesignTimeDbContextFactory<MyContext>' to the project, or see https://go.microsoft.com/fwlink/?linkid=851728 for additional patterns supported at design time.
```
This error states that you do not have setup a `DbContextOptions` object for your `DbContext` class. In other words during command line execution it doesn't know where to execute or check the migrations on. In order for you to workaround that you'll have to implement a `IDesignTimeDbContextFactory<MyContext>`. You'll not have to reference it anywhere, the tooling will just check for the existence and initiate the class. I chose to create an `appsettings.json` file and inject a connectionString inside that file.
```csharp
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<MyContext>
{
    public MyContext CreateDbContext(string[] args)
    {
        IConfigurationRoot configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

        var builder = new DbContextOptionsBuilder<MyContext>();
        var connectionString = configuration.GetConnectionString("SqlConnectionString");
        builder.UseSqlServer(connectionString);
        return new MyContext(builder.Options);
    }
}
```
```json
{
  "ConnectionStrings": {
    "SqlConnectionString": "Server=tcp:whatever.database.windows.net,1433;Initial Catalog=whatever;Persist Security Info=False;User ID=whateveradmin;Password=secret;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```
If you try the command again, it should work.
```cmd
> dotnet ef migrations add InitialCreate
Done. To undo this action, use 'ef migrations remove'
```
## CI / CD
Last but not least you probably want to generate migrations and execute them from within your CI/CD environment. This way you get a fully managed way of migrating/managing your database in all different environments.
### VSTS
<img src="/images/efcore/vstsbuild.png">
In VSTS you just setup a build with the following steps:
* dotnet restore
* dotnet build
* dotnet publish
    - Name the projects of your function apps.
* dotnet custom
    - Add `ef` as custom command
    - Add the arguments below. Name the project and the startup-project.
* Stage the ARM template
* Publish the artifacts

```
migrations script -i --project $(Build.SourcesDirectory)\MyProject.Shared\MyProject.Shared.csproj --startup-project $(Build.SourcesDirectory)\MyProject.Shared.csproj\MyProject.Shared.csproj.csproj -o $(build.artifactstagingdirectory)\Migrations\scripts.sql
```

Its important that you add the `-i` argument. This argument will generate the migrations script in such a way that it checks if the migation is already executed on the database. This prvents the pipeline from applying the same migrations twice. Notice that the migrations script is outputed to the artifacts directory which is publish at the lastest step of the build.

<img src="/images/efcore/vstsrelease.png">
In the release part of the CI/CD pipeline you'll just have to the following:
* Execute the ARM script
* I use ARM script outputs to get the SQL Server name and Database name.
* Stop your Azure Functions
* Redeploy them
* Execute the migrations script against the database
* Restart the Azure Functions.

Well thats it, you've got Azure Functions V2 running Entity Framework Core in Azure! Thanks for reading and happy coding.

## Some tips and tricks
Just some tips and tricks.

Don't worry about this warning. Since EF Core tools are build into the .NET Core tooling you might have mismatches with your EF Core packages.
```
The EF Core tools version '2.1.0-rtm-30799' is older than that of the runtime '2.1.1-rtm-30846'. Update the tools for the latest features and bug fixes.
```
It can also occur that you only get this warning in VSTS. That might be the result of different .NET Core SDK's on your client pc and VSTS. Check [this page](https://github.com/Microsoft/vsts-image-generation/blob/master/images/win/Vs2017-Server2016-Readme.md#net-core) out to see what version of `dotnet` is running in VSTS.

Adding the `-i` argument prevents migrations from being executed twice.
```cmd
> dotnet ef migrations script -i
```
It adds the following check to the generated SQL:
```sql
IF NOT EXISTS(SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20180823120412_InitialCreate')
BEGIN
    -- Generated migrations code here
END
```
To remove all migrations and start over just simply execute this.
It can be handy at the initial development.
```cmd
> dotnet ef database update 0
> dotnet ef migrations remove
```