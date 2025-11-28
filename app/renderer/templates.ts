export interface DiagramTemplate {
  name: string;
  category: string;
  code: string;
}

export const templates: DiagramTemplate[] = [
  {
    name: 'Sequence Diagram',
    category: 'Sequence',
    code: `@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: another authentication Response
@enduml`,
  },
  {
    name: 'Class Diagram',
    category: 'Class',
    code: `@startuml
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
    category: 'Activity',
    code: `@startuml
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
    category: 'Use Case',
    code: `@startuml
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
    category: 'Component',
    code: `@startuml
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
    category: 'State',
    code: `@startuml
[*] --> Idle
Idle --> Running : Start
Running --> Paused : Pause
Paused --> Running : Resume
Running --> [*] : Stop
@enduml`,
  },
];

