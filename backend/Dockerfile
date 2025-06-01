# Use the official .NET SDK to build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY ./backend/*.csproj ./backend/
RUN dotnet restore ./backend/backend.csproj

# Copy the entire source and build
COPY ./backend/ ./backend/
WORKDIR /app/backend
RUN dotnet publish -c Release -o out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/backend/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "backend.dll"]
