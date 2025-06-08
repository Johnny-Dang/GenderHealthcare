# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY *.sln .
COPY bacnkend/*.csproj ./bacnkend/
RUN dotnet restore

# Copy the rest of the source code
COPY . .
WORKDIR /app/bacnkend

# Build the project
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expose port (default for Web API is 80)
EXPOSE 8080

# Set the entrypoint
ENTRYPOINT ["dotnet", "YourProject.dll"]
