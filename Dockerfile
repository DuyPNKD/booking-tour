# Sử dụng SDK .NET 8.0 để build ứng dụng từ Root Repository
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["BookingTourAPI/BookingTourAPI/BookingTourAPI/BookingTourAPI.csproj", "BookingTourAPI/BookingTourAPI/BookingTourAPI/"]
RUN dotnet restore "BookingTourAPI/BookingTourAPI/BookingTourAPI/BookingTourAPI.csproj"

COPY . .
WORKDIR "/src/BookingTourAPI/BookingTourAPI/BookingTourAPI"
RUN dotnet publish "BookingTourAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "BookingTourAPI.dll"]
