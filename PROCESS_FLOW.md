
# Medha Application Process Flow

This document outlines the user and data flow for the Medha application. The diagram below is written in Mermaid syntax and illustrates the journey from user authentication to interacting with the core AI-powered learning features.

```mermaid
graph TD
    subgraph A[User Authentication]
        A1(Landing Page: /) --> A2{User Signed In?};
        A2 -- No --> A3[Login or Signup];
        A3 -- Credentials --> A4[Firebase Auth];
        A4 -- New User --> A5[/onboarding];
        A4 -- Existing User --> B1;
        A2 -- Yes --> B1[Dashboard: /dashboard];
    end

    subgraph B[Onboarding & Dashboard]
        A5 -- User Preferences (Goal, Career) --> A5_1[Save to Firestore];
        A5_1 --> B1;
        B1 -- Displays --> B2[Welcome, Score, Goal];
        B1 -- Contains Links To --> C1;
        B1 -- Contains Links To --> D1;
        B1 -- Contains --> B3[Recent Course History];
        B1 -- Contains --> B4[Reflection Card];
    end

    subgraph C[Adaptive AI Tutor]
        C1(Tutor Page: /my-tutor)
        C1 --> C2{Select Tab};
        C2 -- Create Course --> C3[Course Creation Form];
        C3 -- Topic & Sources --> C4(AI Flow: myTutor);
        C4 -- Generates --> C5[Course Content, Quiz, Reflection Prompt];
        C5 -- Saves to --> C6[Firestore: user's course history];
        C6 --> C7[Display Course & Tabs];
        C7 --> C8{Interact};
        C8 -- Take Quiz --> C9(AI Flow: gradeQuiz);
        C9 -- Updates Score --> C6;
        C8 -- Submit Reflection --> C10(AI Flow: analyzeReflection);
        C10 -- Updates Score --> C6;
        
        C2 -- Chat Buddy --> C11[Chat Interface];
        C11 -- User Message --> C12(AI Flow: talkBuddy);
        C12 -- Saves to --> C13[Firestore: conversation history];
        C13 -- Returns --> C14[Bot Response & Audio];

        C2 -- History --> C15[Course History List];
        C15 -- Selects Course --> C7;
    end

    subgraph D[Essay Feedback]
        D1(Essay Page: /essay-feedback) --> D2[Essay Submission Form];
        D2 -- Essay & Topic --> D3(AI Flow: essayFeedback);
        D3 -- Generates --> D4[Feedback & Highlighted Essay];
        D4 --> D5[Display Feedback];
        D5 -- Follow-up Question --> D6(AI Flow: essayFeedbackChat);
        D6 --> D7[Display Chat Response & Updated Essay];
    end

    subgraph E[Backend Services]
        E1(Firebase Auth);
        E2(Firestore Database);
        E3(Genkit AI Flows);
        E4(Google AI - Gemini);
    end

    %% Styling
    style A fill:#f1f5f9,stroke:#333,stroke-width:2px;
    style B fill:#f0f9ff,stroke:#333,stroke-width:2px;
    style C fill:#f0fdf4,stroke:#333,stroke-width:2px;
    style D fill:#fefce8,stroke:#333,stroke-width:2px;
    style E fill:#faf5ff,stroke:#333,stroke-width:2px;

    %% Connections
    C4 --> E3; D3 --> E3; D6 --> E3; C9 --> E3; C10 --> E3; C12 --> E3;
    A4 --> E1;
    A5_1 --> E2; C6 --> E2; C13 --> E2;
    E3 --> E4;
```
