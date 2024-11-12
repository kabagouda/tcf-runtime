const puppeteer = require("puppeteer");
const path = require("path");

async function registerCandidate(candidate) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  try {
    const page = await browser.newPage();
    await page.goto(
      "https://douala.ifc-tests-examens.com/examens-session/10-test-de-connaissance-du-franais-pour-le-canada"
    );

    // Wait for form to be loaded
    await page.waitForSelector('form[action="/process-inscription"]');

    // Fill basic information
    await page.type("#email", candidate.email);
    await page.type("#name", candidate.Legal_last_name);
    await page.type("#firstname", candidate.Legal_first_name);
    await page.type("#birthdate", candidate.Your_question_or_concern);
    await page.type("#phoneNumber", candidate.Client_number);

    // Upload photo (assuming files exist)
    const photoInput = await page.$('input[name="kyc[avatar]"]');
    await photoInput.uploadFile(path.join(__dirname, "assets/photo.jpg"));

    // Select default values for dropdowns
    await page.select('select[name="utilisateur[birthPlace]"]', "Cameroun");
    await page.select('select[name="utilisateur[sexe]"]', "masculin");
    await page.select('select[name="utilisateur[nationalite]"]', "Cameroun");
    await page.select('select[name="utilisateur[langueUsuelle]"]', "français");
    await page.select('select[name="motifQualification"]', "F");
    await page.select('select[name="utilisateur[document]"]', "cni");

    // Fill document info
    await page.type(
      'input[name="utilisateur[numeroDocument]"]',
      `CNI${candidate.id}`
    );

    // Upload document photos
    const frontPhotoInput = await page.$('input[name="kyc[frontSidePhoto]"]');
    const backPhotoInput = await page.$('input[name="kyc[backSidePhoto]"]');
    await frontPhotoInput.uploadFile(
      path.join(__dirname, "assets/cni_front.jpg")
    );
    await backPhotoInput.uploadFile(
      path.join(__dirname, "assets/cni_back.jpg")
    );

    // Check authorization checkbox
    await page.click("#authorisationCandidat");

    // Wait for recaptcha and solve it (requires manual intervention or external service)
    await page.waitForSelector(".g-recaptcha");

    // Wait for manual captcha solving and form submission
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 });

    console.log(`Registration completed for ${candidate.Legal_first_name}`);
  } catch (error) {
    console.error(`Error registering ${candidate.Legal_first_name}:`, error);
  } finally {
    await browser.close();
  }
}

async function registerAllCandidates(candidates) {
  for (const candidate of candidates) {
    console.log(`Starting registration for ${candidate.Legal_first_name}`);
    await registerCandidate(candidate);
    // Add delay between registrations
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

// Execute the registration process
registerAllCandidates(candidates);
