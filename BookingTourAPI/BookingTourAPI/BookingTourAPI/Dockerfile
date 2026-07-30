# Sử dụng SDK .NET 8.0 để build ứng dụng
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj và restore các thư viện
COPY ["BookingTourAPI.csproj", "./"]
RUN dotnet restore "BookingTourAPI.csproj"

# Copy toàn bộ code và publish
COPY . .
RUN dotnet publish "BookingTourAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Môi trường chạy (Runtime) siêu nhẹ .NET 8.0 ASP.NET
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render tự động gán cổng qua biến PORT (mặc định 10000 hoặc 8080)
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

# Chạy ứng dụng Web API
ENTRYPOINT ["dotnet", "BookingTourAPI.dll"]
