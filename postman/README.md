# Healthcare Management System — Postman Testing Guide

This directory contains the ready-to-import Postman Collection for testing all APIs of the Healthcare Management System.

## File:
`Healthcare_Management_System.postman_collection.json`

## How to Import into Postman:
1. Open the **Postman** desktop application or web app.
2. Click the **Import** button in the top-left corner.
3. Drag & drop `Healthcare_Management_System.postman_collection.json` or click **Upload Files** and select this file.
4. The collection **"Healthcare Management System API"** will appear in your left sidebar.

## Automated Variables & Token Handling:
The collection includes pre-configured variables:
- `baseUrl`: Defaults to `http://localhost:5000/api`
- `authToken`: Automatically populated when you run **Register User** or **Login User**!
- `patientId`: Automatically captured when creating a patient.
- `doctorId`: Automatically captured from the seed doctors list.
- `mappingId`: Automatically captured when creating an assignment.

## Testing Sequence:
1. **01. Authentication**:
   - Run `Register User` or `Login User` -> The response script extracts the JWT and stores it in `{{authToken}}`.
   - Run `Get Current User Profile` to verify authentication.
2. **02. Patients**:
   - Run `Create Patient` -> Creates a patient linked to the authenticated user.
   - Run `Get All Patients (User's)` -> Verifies ownership filtering.
   - Run `Get Patient by ID` -> Fetches the detailed patient record.
   - Run `Update Patient` -> Updates address or medical details.
3. **03. Doctors**:
   - Run `Get All Available Doctors` -> Lists all active doctors.
   - Run `Create Doctor Record` -> Adds a new doctor.
   - Run `Update Doctor Record` -> Updates specialization or phone.
4. **04. Patient-Doctor Mappings**:
   - Run `Assign Doctor to Patient` -> Links the patient to a doctor.
   - Run `Get All User's Patient Mappings` -> Lists assignments across all your patients.
   - Run `Get Doctors by Patient ID` -> Lists all doctors assigned to that patient.
   - Run `Remove Assignment (Delete Mapping)` -> Unassigns the doctor safely.
