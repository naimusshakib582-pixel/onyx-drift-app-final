# ১. বিল্ড স্টেজ
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# ২. রান স্টেজ
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# ৩. পোর্ট এক্সপোজ
EXPOSE 8080

# ৪. রান কমান্ড
ENTRYPOINT ["java", "-jar", "app.jar"]