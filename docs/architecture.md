# Arsitektur Tingkat Tinggi

## Diagram Konteks
```mermaid
graph TD
    App[Mobile App (Kotlin + Jetpack Compose)]
    APIGW[API Gateway]
    AuthService[Auth Service]
    OrderService[Order Service]
    PaymentService[Payment Service]
    ProfileService[Profile Service]

    App <--> APIGW
    APIGW <--> AuthService
    APIGW <--> OrderService
    APIGW <--> PaymentService
    APIGW <--> ProfileService
