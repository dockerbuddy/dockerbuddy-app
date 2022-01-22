FROM openjdk:11
COPY ./backend/target/ .
ENTRYPOINT ["java", "-jar", "dockerbuddy-1.0.0.jar"]