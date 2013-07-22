#cosy-boot

##Purpose

This library is responsible for registering the Component in the right order.
The idea is that you have modules and inside modules, you have component.

When the page is being parsed the it should create a flat list of all Modules which each module should have a flat list of all Components.

###Basic Cases

´´´javascript
####One module, one component
-
|-- MODULE
    |---- COMPONENT
´´´

´´´javascript
####1 module, 2 components
-
|-- MODULE
    |---- COMPONENT
    |
    |---- COMPONENT
´´´

´´´javascript
####2 Modules, 2 components
-
|-- MODULE
|    |---- COMPONENT
|    |
|    |---- COMPONENT
|
|-- MODULE
    |---- COMPONENT
    |
    |---- COMPONENT
´´´

###Nested Cases
´´´javascript
####3 Modules (one nested), 2 components each
-
|-- MODULE
    |---- COMPONENT
    |
    |---- COMPONENT
    |
    |-- MODULE
        |
        |---- COMPONENT
        |
        |---- COMPONENT
    |
    |-- MODULE
        |
        |---- COMPONENT
        |
        |---- COMPONENT
´´´

´´´javascript
####3 Modules (all nested), 2 components each
-
|-- MODULE
    |---- COMPONENT
    |
    |---- COMPONENT
    |
    |-- MODULE
        |
        |---- COMPONENT
        |
        |---- COMPONENT
        |
        |-- MODULE
            |
            |---- COMPONENT
            |
            |---- COMPONENT
´´´
###Nested Components Cases
´´´javascript
-
|-- MODULE
    |---- COMPONENT
            |---- COMPONENT
´´´