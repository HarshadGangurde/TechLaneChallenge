# Product Requirements Document (PRD)

## DeboisTech Tech Lane Challenge

**Product:** Gamified Technology Career Discovery & Consultation Lead Generation System  
**Organisation:** DeboisTech  
**Event:** GDG Nashik DevFest 2026  
**Target launch date:** 25 October 2026  
**Document version:** 1.0  
**Status:** Draft for development

---

## 1. Product Overview

The DeboisTech Tech Lane Challenge is an interactive, gamified web application that helps students explore different technology career paths through short challenges.

Students access the application by scanning a QR code at the DeboisTech activation zone during GDG Nashik DevFest 2026. They complete interactive questions or mini challenges, earn points, and receive a recommended technology track based on their answers and performance.

After viewing the recommendation, students can select their preferred track and unlock an opportunity to request a **free career and technology-track consultation with DeboisTech**.

The application collects the student's contact and educational details and stores the consultation request directly in Google Sheets. CSV export should also be available for reporting, backup, and offline processing.

### Core product principle

**Play → Discover → Choose Your Track → Request Free Consultation → Save Lead**

The experience should feel like a technology discovery game rather than a conventional internship registration form.

## 2. Problem Statement

Students attending technology events often have difficulty deciding which technology domain to explore. Traditional promotional brochures and registration forms may not give students enough reason to engage or provide their contact details.

DeboisTech needs an interactive experience that:

- Attracts students through engaging, technology-themed challenges.
- Helps students discover relevant technology career paths.
- Encourages students to choose a track based on their interests.
- Generates qualified leads for future training and internship cohorts.
- Enables the team to follow up with interested students.
- Captures leads centrally without requiring manual data entry.

## 3. Product Goals

### Primary goals

1. Make technology career discovery interactive and enjoyable.
2. Recommend a suitable track after challenge completion.
3. Let each student choose the track they actually want to explore.
4. Offer free consultation requests after track selection.
5. Automatically save submitted lead details to Google Sheets.
6. Build a database of interested students for future workshops and cohorts.

### Secondary goals

- Increase DeboisTech brand awareness at DevFest.
- Increase registrations for future workshops and cohort announcements.
- Identify which tracks attract the most interest.
- Help the team measure challenge engagement and lead conversion.

### Success metrics

Initial targets for the MVP:

- At least 100 challenge starts during the event.
- At least 60% challenge completion among students who start.
- At least 50 completed student lead records.
- At least 90% of valid form submissions successfully stored.
- 100% of successfully submitted consultation requests receive an on-screen confirmation.
- Zero public disclosure of program fees.

These are initial targets for planning, not guaranteed outcomes.

## 4. Target Audience

### Primary audience

College students, particularly second- and third-year engineering and technology students who are exploring possible technology careers.

### Secondary audience

- First- and final-year students.
- Students looking to switch technical domains.
- Fresh graduates.
- Working professionals interested in upskilling.

The interface must use straightforward language, short instructions, and mobile-friendly interactions.

## 5. Technology Tracks

The MVP must support the following six tracks:

1. AI/ML Engineering
2. Cloud & DevOps Engineering
3. Forward Deployed Engineering (FDE)
4. Mobile App Development
5. Generative AI Development
6. Agentic AI Development

Each track must have a unique description, a career-path recommendation, relevant challenge questions, and a suggested practical skill or project.

The track catalogue should be configurable so DeboisTech can add or update tracks without redesigning the entire application.

## 6. User Journey

### Step 1: Entry Page

The student scans a QR code and opens the web application.

The landing screen contains:

- DeboisTech branding.
- Product heading: “Your Tech. Your Path.”
- Supporting text: “Take the challenge. Discover your tech lane.”
- A brief explanation of the activity.
- A “Start Challenge” button.
- An estimated completion time of approximately 2–4 minutes.

No account or password should be required.

### Step 2: Gamified Challenge

The student completes a short sequence of interactive challenges.

Challenge formats may include:

- Multiple-choice questions.
- Scenario-based decisions.
- Simple debugging questions.
- Architecture or workflow puzzles.
- Questions about preferred working styles and problem-solving interests.

Examples:

**AI/ML:** You have a dataset containing customer information. What approach would help predict whether a customer might leave?

**Cloud & DevOps:** Your application works on your laptop but fails after deployment. What would you investigate first?

**FDE:** A business team has a recurring manual process. How would you identify and implement a useful technical solution?

**Mobile Development:** You want to let users track daily habits. Which core functionality would you build first?

**Generative AI:** You want to build a question-answering assistant over a collection of documents. Which approach would you explore?

**Agentic AI:** You need an AI system to research information and use a tool to complete a task. What capabilities would the workflow require?

Questions should test basic reasoning and interests rather than advanced knowledge. Beginners must be able to participate.

### Step 3: Gamification

The challenge experience should include:

- Progress indicator.
- One question or challenge per screen.
- Interactive answer choices.
- Immediate feedback after an answer.
- Points for correct answers or completed activities.
- A completion screen with the student's score.
- A badge such as “Tech Explorer.”
- Optional short explanations that teach students something useful.

The MVP must not have a public leaderboard, user accounts, or complex multiplayer functionality.

Points should make the experience fun; they must not determine scholarship eligibility or be presented as a scientifically validated measure of career suitability.

### Step 4: Track Recommendation

When the student finishes the challenge, the system evaluates their responses and generates a recommended track.

The results screen must display:

- Recommended track name.
- A concise explanation of why it was recommended.
- A short description of the career path.
- Two or three skills relevant to that track.
- One suggested beginner project.
- A “Choose This Track” button.
- An option to view and select another track.

The recommendation should combine challenge responses, stated interests, and relevant domain scores.

If two or more tracks have similar scores, the system may present multiple suitable paths.

**Important:** the recommendation is guidance, not a final career assessment.

### Step 5: Student Selects a Track

The student must explicitly choose a preferred track before proceeding to the consultation form.

The student may select the recommended track or a different track from the available list.

The selected track becomes the primary track of interest saved with the consultation lead.

Once a track has been selected, the system enables the “Request Free Consultation” button.

Do not require students to request a consultation simply to view their result. The consultation should be an optional next step.

### Step 6: Consultation Registration Form

The student sees a form headed:

**“Your Next Step Starts Here”**

Supporting text:

“Request a free consultation with DeboisTech to discuss your selected technology path, learning roadmap, project opportunities, and relevant upcoming programs.”

Required fields:

1. Full name.
2. Mobile number with country code.
3. Selected technology track, prefilled from the student's choice.
4. Current status — college student, graduate, working professional, or other.
5. College or organisation name.
6. Preferred consultation format — phone call or office visit.
7. Preferred contact time or availability.
8. Consent to be contacted regarding this consultation.

Email address is also required (changed from optional).

The system should clearly identify required and optional fields, validate the mobile number, and display understandable errors when information is incomplete.

Avoid asking for sensitive personal information that is unnecessary for consultation.

### Step 7: Submission and Confirmation

When the student submits the form:

1. Validate all required fields.
2. Create a consultation lead record.
3. Send the record to the configured Google Sheets integration.
4. Confirm successful receipt by the storage service.
5. Display a success screen only after a successful save.

Suggested success message:

“Your consultation request has been submitted successfully!

The DeboisTech team will contact you using the details you provided to coordinate your free consultation.

Meanwhile, keep exploring and building.”

If the save fails, show a clear retry message and preserve the entered form data where possible.

A consultation request does not mean a consultation appointment has already been booked. The team will confirm the appointment separately.

## 7. Functional Requirements

| ID    | Requirement                                                              | Priority    |
| ----- | ------------------------------------------------------------------------ | ----------- |
| FR-01 | The application must open through a QR-code link in a mobile browser.    | Must have   |
| FR-02 | Students must be able to start without creating an account.              | Must have   |
| FR-03 | The application must display interactive challenges.                     | Must have   |
| FR-04 | The application must track challenge progress and points.                | Must have   |
| FR-05 | The application must calculate a recommended track.                      | Must have   |
| FR-06 | Students must be able to select their preferred track.                   | Must have   |
| FR-07 | Consultation requests must remain unavailable until a track is selected. | Must have   |
| FR-08 | The consultation form must validate required contact fields.             | Must have   |
| FR-09 | Valid consultation submissions must be stored in Google Sheets.          | Must have   |
| FR-10 | The system must display success or failure status.                       | Must have   |
| FR-11 | Authorised users must be able to export leads to CSV.                    | Must have   |
| FR-12 | The application must work on modern mobile and desktop browsers.         | Must have   |
| FR-13 | The application must record basic funnel analytics.                      | Should have |
| FR-14 | The team should be able to view lead status and follow-up notes.         | Should have |
| FR-15 | Track descriptions and challenge questions should be configurable.       | Should have |

## 8. Track Recommendation Logic

The recommendation engine should be rule-based in the MVP. An external AI model is not required.

Each challenge response contributes evidence toward one or more track-interest scores.

Possible signals:

- Interest in working with data, predictions, and learning algorithms.
- Interest in infrastructure, automation, and deployments.
- Interest in understanding business problems and delivering technical solutions.
- Interest in user-facing applications and mobile experiences.
- Interest in LLMs, retrieval, and content generation.
- Interest in tool-using agents and multistep automated workflows.

A simple scoring model can award points to the relevant track or tracks for each answer.

At the end:

1. Calculate the six track scores.
2. Sort the scores in descending order.
3. Display the highest-scoring track as the primary recommendation.
4. Show a second option if the scores are sufficiently close.
5. Allow the student to select any available track regardless of the recommendation.

The scoring model should be configurable and tested with sample responses before launch.

## 9. Data Model and Lead Storage

### Preferred storage: Google Sheets

Google Sheets should be the primary data destination because the DeboisTech team can access, filter, and manage incoming leads without building a separate CRM.

Each successful consultation submission creates one row in a dedicated spreadsheet.

Recommended spreadsheet columns:

| Column                 | Description                                       |
| ---------------------- | ------------------------------------------------- |
| Lead ID                | Unique submission identifier                      |
| Created At             | Submission timestamp                              |
| Name                   | Student's full name                               |
| Phone                  | Contact number                                    |
| Email                  | Required                                          |
| College / Organisation | Institution or workplace                          |
| Current Status         | Student, graduate, professional, other            |
| Recommended Track      | Track generated by the challenge                  |
| Selected Track         | Track selected by the student                     |
| Challenge Score        | Total game score                                  |
| Consultation Format    | Phone call or office visit                        |
| Preferred Availability | Student's preferred contact window                |
| Consent                | Contact consent recorded                          |
| Lead Source            | DevFest booth, brochure, stage, or another source |
| Campaign               | GDG Nashik DevFest 2026                           |
| Lead Status            | New, Contacted, Scheduled, Completed, Closed      |
| Follow-up Notes        | Notes entered by the authorised team              |

Recommended additional analytics data may include a random session identifier, challenge start/completion timestamps, and an event source label. Avoid storing full answer histories unless they are needed.

### CSV support

CSV should be supported as an export option for authorised team members.

The MVP should not require students to download or upload CSV files themselves.

If Google Sheets integration is temporarily unavailable, the system should retry and retain failed submissions safely until they can be saved. A CSV fallback may be implemented for an authorised operator, provided records are protected and later reconciled to prevent duplicates.

## 10. Proposed Technical Architecture

A lightweight, mobile-first web application is sufficient for the MVP.

Suggested stack:

- **Frontend:** Next.js with TypeScript.
- **UI:** Tailwind CSS or an equivalent responsive styling approach.
- **Backend:** Next.js server-side route handlers.
- **Lead storage:** Google Sheets API using a dedicated service account.
- **Lead export:** Server-generated CSV.
- **Hosting:** An HTTPS-enabled hosting platform.
- **Analytics:** Lightweight event tracking for challenge starts, completions, track selections, and consultation submissions.

### Data flow

QR Code → Web Application → Challenge Engine → Track Recommendation → Track Selection → Consultation Form → Backend Validation → Google Sheets → Confirmation Screen.

### Integration requirements

- Google API credentials must remain server-side.
- The browser must never receive Google service-account credentials or private keys.
- The backend must validate submissions before writing to the spreadsheet.
- The application must use HTTPS.
- Duplicate submissions should be detected where practical without preventing a student from intentionally requesting another consultation.
- Storage failures must be logged without exposing personal contact details in public error messages.

The application does not need a complicated database or microservice architecture for the initial event. Google Sheets is adequate as an MVP lead-management destination, with the option to introduce a database or CRM if volumes and operational needs grow.

## 11. UI/UX Requirements

### Visual direction

The application should follow DeboisTech branding with a modern, clean developer-community aesthetic.

Suggested direction:

- White or near-black backgrounds with DeboisTech green accents.
- Large typography and high-contrast buttons.
- Compact cards, simple icons, and progress indicators.
- Subtle animations for points and results.
- Clear mobile-first layouts.
- Accessible colour contrast and keyboard navigation.

Avoid excessive visual effects that could slow down the experience on mobile data.

### Required screens

1. Welcome / landing screen.
2. Challenge introduction.
3. Challenge question screen.
4. Challenge completion screen.
5. Recommended-track results screen.
6. Track-selection screen or selector.
7. Consultation form.
8. Submission success screen.
9. Submission error / retry state.

## 12. Privacy and Security

Because the system collects names and phone numbers, responsible handling of personal data is mandatory.

Requirements:

- Explain why contact information is being collected.
- Obtain an affirmative consent action before submitting a consultation request.
- Make workshop announcements and ongoing marketing communications a separate optional consent wherever applicable.
- Restrict spreadsheet and export access to authorised DeboisTech team members.
- Keep credentials and sensitive configuration out of frontend code and source control.
- Use server-side validation and reasonable rate limiting.
- Protect against spam and repeated automated submissions.
- Establish a retention policy for leads and delete records when they are no longer required, subject to applicable legal obligations.
- Provide a contact route for correction or deletion requests.
- Follow applicable Indian data-protection requirements.

Do not publicly expose the spreadsheet or embed a writable Google Sheets URL in the frontend.

## 13. Analytics and Reporting

The MVP should measure the following events:

- `landing_view`
- `challenge_started`
- `challenge_completed`
- `track_recommended`
- `track_selected`
- `consultation_form_opened`
- `consultation_submitted`
- `consultation_save_failed`

The team should be able to determine:

- How many students started and completed the game.
- Which track was recommended most often.
- Which track students selected.
- How many students progressed to the consultation form.
- How many consultation leads were successfully saved.
- Which source generated the most engagement and leads.

Do not include names or phone numbers in analytics event payloads.

## 14. MVP Scope

### Included in the first release

- QR-based application access.
- Six technology tracks.
- Gamified challenges with points and progress.
- Rule-based track recommendation.
- Manual student selection of a preferred track.
- Free-consultation request form.
- Server-side Google Sheets integration.
- Success and error states.
- CSV export.
- Basic funnel analytics.
- Responsive mobile UI.

### Excluded from the first release

- Student accounts or login.
- Payment processing.
- Public leaderboards.
- Complex multiplayer games.
- Automated AI career counselling.
- Automated WhatsApp messaging.
- Calendar-based appointment booking.
- A full CRM.
- Automated scholarship decisions or scholarship disbursement.

These can be considered after validating the MVP.

## 15. Acceptance Criteria

The product is ready for launch when all of the following are verified:

1. A student can open the application through the event QR code on a mobile phone.
2. A student can complete the challenge without registering an account.
3. Challenge completion produces a valid track recommendation.
4. The student can choose a track different from the recommendation.
5. The consultation request button stays disabled until a track is selected.
6. A valid form submission creates a Google Sheets row with the correct selected track and contact data.
7. Invalid submissions are rejected with clear explanations.
8. A successful save triggers a confirmation message.
9. A temporary storage failure does not falsely report success or silently discard the request.
10. Authorised staff can export lead data to CSV.
11. Spreadsheet credentials are not exposed in client-side code.
12. The application is tested on common Android and iOS mobile browsers.
13. All six recommendation paths have been tested with representative answers.
14. The form explains contact usage and obtains the required consent.
15. The application contains no publicly visible program fees.

## 16. Risks and Mitigations

**Risk: Students abandon the game.**  
Mitigation: Keep it to approximately 2–4 minutes, show progress, and provide immediate feedback.

**Risk: The recommendation does not match the student's interests.**  
Mitigation: Explain that it is a suggestion, allow manual selection, and show alternative tracks.

**Risk: Internet connectivity is unreliable at the venue.**  
Mitigation: Optimise page size, provide a backup QR URL, and prepare an offline lead-capture contingency for the team.

**Risk: Google Sheets is unavailable.**  
Mitigation: Implement retries, server-side error logging, and a controlled recovery process.

**Risk: Students submit incorrect numbers or fake contact information.**  
Mitigation: Validate fields, use reasonable anti-spam controls, and verify contact information during follow-up.

**Risk: The team cannot respond to all leads.**  
Mitigation: Prioritise leads who explicitly request consultations, segment by track, and maintain a clear follow-up workflow.

## 17. Delivery Plan

### Phase 1 — Product preparation

- Finalise challenge questions.
- Define the track scoring rules.
- Approve the consultation form and privacy text.
- Create the destination Google Sheet.

### Phase 2 — Development

- Build the responsive UI.
- Implement the challenge engine and track recommendation.
- Build track selection and consultation registration.
- Integrate Google Sheets and CSV export.

### Phase 3 — Testing

- Test all six tracks.
- Validate mobile layouts and QR access.
- Test successful, invalid, duplicate, and failed submissions.
- Verify spreadsheet permissions and data mapping.

### Phase 4 — Event launch

- Publish the production URL.
- Generate and test the final QR code.
- Brief the event team.
- Monitor submissions and verify that records are saved successfully.

## 18. Final Product Definition

The DeboisTech Tech Lane Challenge is a gamified student-engagement and consultation lead-generation system.

Its primary job is to make students curious, help them explore technology career paths, give them control over their preferred track, and provide a clear route to free consultation.

Its operational job is to turn those interactions into valid, consented, track-specific leads that DeboisTech can manage through Google Sheets and export through CSV.

**The MVP should optimise for three outcomes: student engagement, useful track discovery, and reliable lead capture.**
