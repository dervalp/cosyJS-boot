#cosy-boot

This library is used client side and by cosy-core in order to register and expose components.

##Purpose

This library is responsible for registering components and module on a page.
It supports nested modules and nested apps.

###Basic Cases

```
####One module, one component
-
|-- MODULE
    |---- COMPONENT
```

```
####1 module, 2 components
-
|-- MODULE
    |---- COMPONENT
    |
    |---- COMPONENT
```

```
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
```

###Nested Cases

####3 Modules (one nested), 2 components each
```
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
```

####3 Modules (all nested), 2 components each
```
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
```
###Nested Components Cases
```
-
|-- MODULE
    |---- COMPONENT
            |---- COMPONENT
```