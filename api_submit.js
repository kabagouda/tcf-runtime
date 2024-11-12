const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function submitCandidateAPI(candidate) {
  const formData = new FormData();

  // Required form fields from the endpoint /process-inscription
  formData.append("utilisateur[email]", candidate.email);
  formData.append("utilisateur[name]", candidate.Legal_last_name);
  formData.append("utilisateur[firstname]", candidate.Legal_first_name);
  formData.append("utilisateur[birthdate]", candidate.Your_question_or_concern);
  formData.append("utilisateur[phoneNumber]", candidate.Client_number);
  formData.append("utilisateur[birthPlace]", "Cameroun");
  formData.append("utilisateur[sexe]", "masculin");
  formData.append("utilisateur[nationalite]", "Cameroun");
  formData.append("utilisateur[langueUsuelle]", "français");
  formData.append("utilisateur[document]", "cni");
  formData.append("utilisateur[numeroDocument]", `CNI${candidate.id}`);
  formData.append("utilisateur[authorisationCandidat]", "1");
  formData.append("motifQualification", "F");
  formData.append("produit", "10");
  formData.append("session", "8");
  formData.append("cartPrice", "210000");

  // Add files
  formData.append("kyc[avatar]", fs.createReadStream(candidate.assets.photo));
  formData.append(
    "kyc[frontSidePhoto]",
    fs.createReadStream(candidate.assets.cni_front)
  );
  formData.append(
    "kyc[backSidePhoto]",
    fs.createReadStream(candidate.assets.cni_back)
  );

  const config = {
    headers: {
      ...formData.getHeaders(),
      Origin: "https://douala.ifc-tests-examens.com",
      Referer:
        "https://douala.ifc-tests-examens.com/examens-session/10-test-de-connaissance-du-franais-pour-le-canada",
    },
  };

  try {
    const response = await axios.post(
      "https://douala.ifc-tests-examens.com/process-inscription",
      formData,
      config
    );
    return response.data;
  } catch (error) {
    console.log(
      `Error submitting candidate ${candidate.Legal_first_name}:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

async function processAllCandidates(candidates) {
  for (const candidate of candidates) {
    console.log(`Processing ${candidate.Legal_first_name}`);
    await submitCandidateAPI(candidate);
    await new Promise((r) => setTimeout(r, 2000)); // Rate limiting
  }
}
