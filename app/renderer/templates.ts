export interface Template {
  name: string;
  category: string;
  source: string;
}

export const TEMPLATES: Template[] = [
  {
    name: 'Sequence Diagram',
    category: 'Behavioral',
    source: `@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: another authentication Response
@enduml`,
  },
  {
    name: 'Class Diagram',
    category: 'Structural',
    source: `@startuml
class Animal {
  - name: String
  + getName(): String
  + setName(name: String): void
}

class Dog {
  - breed: String
  + bark(): void
}

class Cat {
  - color: String
  + meow(): void
}

Animal <|-- Dog
Animal <|-- Cat
@enduml`,
  },
  {
    name: 'Activity Diagram',
    category: 'Behavioral',
    source: `@startuml
start
:Login;
if (Login successful?) then (yes)
  :Show dashboard;
else (no)
  :Show error message;
  stop
endif
:Logout;
stop
@enduml`,
  },
  {
    name: 'Use Case Diagram',
    category: 'Behavioral',
    source: `@startuml
left to right direction
actor User
rectangle System {
  User --> (Login)
  User --> (View Profile)
  User --> (Update Profile)
  User --> (Logout)
}
@enduml`,
  },
  {
    name: 'Component Diagram',
    category: 'Structural',
    source: `@startuml
package "Frontend" {
  [React App]
  [UI Components]
}

package "Backend" {
  [API Server]
  [Database]
}

[React App] --> [API Server]
[API Server] --> [Database]
@enduml`,
  },
  {
    name: 'State Diagram',
    category: 'Behavioral',
    source: `@startuml
[*] --> Idle
Idle --> Running : Start
Running --> Paused : Pause
Paused --> Running : Resume
Running --> [*] : Stop
@enduml`,
  },
  {
    name: 'ER Diagram',
    category: 'Structural',
    source: `@startuml
entity "Customer" as customer {
  *customer_id : number
  --
  *name : string
  email : string
}

entity "Order" as order {
  *order_id : number
  --
  *customer_id : number <<FK>>
  total : decimal
}

customer ||--o{ order : places
@enduml`,
  },
  {
    name: 'Mind Map',
    category: 'Other',
    source: `@startmindmap
* Open UML
** Diagrams
*** Sequence
*** Class
*** Activity
** Export
*** PNG / SVG / PDF
@endmindmap`,
  },
  {
    name: 'Gantt Chart',
    category: 'Other',
    source: `@startgantt
projectscale weekly
[Prototype design] lasts 2 weeks
[Implementation] lasts 4 weeks
[Implementation] starts at [Prototype design]'s end
[Test] lasts 1 week
[Test] starts at [Implementation]'s end
@endgantt`,
  },
  {
    name: 'C4 Container Diagram',
    category: 'Architecture',
    source: `@startuml
!include <C4/C4_Container>
Person(user, "Student", "Draws UML diagrams")
System(openuml, "Open UML", "Offline PlantUML editor")
Rel(user, openuml, "Uses")
@enduml`,
  },
  {
    name: 'Deployment Diagram',
    category: 'Structural',
    source: `@startuml
node "Client" {
  [Browser]
}

node "Server" {
  [App Server]
  [Database]
}

[Browser] --> [App Server] : HTTPS
[App Server] --> [Database] : SQL
@enduml`,
  },
  {
    name: 'Sequence (with math)',
    category: 'Behavioral',
    source: `@startuml
Alice -> Bob: Compute <math>int_0^1 f(x)dx</math>
Bob --> Alice: Result: <math>sqrt(2)</math>
@enduml`,
  },
];
