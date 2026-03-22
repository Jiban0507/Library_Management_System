FROM eclipse-temurin:17-jdk

# Backend workdir
WORKDIR /app/backend

# Copy backend code
COPY backend /app/backend

# Make Maven wrapper executable
RUN chmod +x mvnw

# Build the jar
RUN ./mvnw clean package

# Expose port
EXPOSE 8080

# Run the jar
CMD ["java", "-jar", "target/library-management-system-0.0.1-SNAPSHOT.jar"]