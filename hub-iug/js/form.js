import { storage } from './storage.js';
import { showToast } from './app.js'; // sera importé depuis app.js, mais on peut l'exporter

// Fonction exportée pour initialiser le formulaire
export function initForm() {
  document.getElementById('clear-form-btn').addEventListener('click', clearForm);
  document.getElementById('download-form-btn').addEventListener('click', validateAndGeneratePDF);
}

function clearForm() {
  document.getElementById('inscription-form').reset();
  setCurrentDate();
  clearValidationErrors();
  showToast('Formulaire vidé.');
}

function setCurrentDate() {
  const dateInput = document.getElementById('current-date-input');
  if (dateInput) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    dateInput.value = `${day}/${month}/${year}`;
  }
}

function setAcademicYear() {
  const span = document.getElementById('academic-year');
  if (span) {
    const now = new Date();
    const year = now.getFullYear();
    const startYear = now.getMonth() >= 8 ? year : year - 1;
    span.textContent = `${startYear}-${startYear + 1}`;
  }
}

// Appelé quand on affiche la section inscription
export function initInscriptionDate() {
  setCurrentDate();
  setAcademicYear();
}

function clearValidationErrors() {
  document.querySelectorAll('#inscription-form .invalid').forEach(el => el.classList.remove('invalid'));
  document.querySelectorAll('#inscription-form .error-message').forEach(el => el.remove());
}

function validateForm() {
  clearValidationErrors();
  let isValid = true;
  const form = document.getElementById('inscription-form');

  const showError = (field, message) => {
    field.classList.add('invalid');
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    field.parentNode.appendChild(error);
  };

  // Champs obligatoires
  form.querySelectorAll('[required]').forEach(field => {
    if (field.type === 'radio') {
      const name = field.name;
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      if (!checked) {
        isValid = false;
        const radioGroup = field.closest('.radio-group');
        if (radioGroup) {
          radioGroup.querySelectorAll('input').forEach(inp => inp.classList.add('invalid'));
          const error = document.createElement('div');
          error.className = 'error-message';
          error.textContent = 'Veuillez choisir une option.';
          radioGroup.parentNode.appendChild(error);
        }
      }
    } else if (field.value.trim() === '') {
      isValid = false;
      showError(field, 'Ce champ est obligatoire.');
    }
  });

  // Validation téléphones
  const phoneIds = ['student-phone', 'parent-phone', 'mother-phone'];
  phoneIds.forEach(id => {
    const field = document.getElementById(id);
    if (field && field.value.trim() !== '' && !/^\d{9}$/.test(field.value.trim())) {
      isValid = false;
      showError(field, 'Doit contenir 9 chiffres.');
    }
  });

  // Année obtention
  const gradYear = document.getElementById('graduation-year');
  if (gradYear && gradYear.value.trim() !== '' && !/^\d{4}$/.test(gradYear.value.trim())) {
    isValid = false;
    showError(gradYear, 'Année invalide (4 chiffres).');
  }

  return isValid;
}

function getFormData() {
  return {
    nom: document.getElementById('nom').value.trim(),
    prenom: document.getElementById('prenom').value.trim(),
    sexe: document.getElementById('sexe').value,
    dateNaissance: document.getElementById('dateNaissance').value,
    lieuNaissance: document.getElementById('lieuNaissance').value.trim(),
    nationalite: document.getElementById('nationalite').value.trim(),
    regionOrigine: document.getElementById('regionOrigine').value.trim(),
    telephone: document.getElementById('student-phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    baccalaureat: document.getElementById('baccalaureat').value.trim(),
    graduationYear: document.getElementById('graduation-year').value.trim(),
    dernierEtablissement: document.getElementById('dernierEtablissement').value.trim(),
    classe: document.getElementById('classe').value.trim(),
    specialite: document.getElementById('specialite').value,
    schedule: document.querySelector('input[name="schedule"]:checked')?.value || '',
    nomPere: document.getElementById('nomPere').value.trim(),
    phonePere: document.getElementById('parent-phone').value.trim(),
    nomMere: document.getElementById('nomMere').value.trim(),
    phoneMere: document.getElementById('mother-phone').value.trim(),
    professionPere: document.getElementById('professionPere').value.trim(),
    professionMere: document.getElementById('professionMere').value.trim()
  };
}

async function sendToGoogleSheets(data) {
  const url = 'https://script.google.com/macros/s/AKfycbznVotPLsRILOLRHvM2v-Vj24qMnmelqU-NpzNhTJ4XNisOtdna7hAXpCnJd7ShqN1P/exec';
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    showToast('Données envoyées au serveur (simulation).');
  } catch (err) {
    console.error('Erreur envoi Google Sheets', err);
    showToast('Erreur lors de l\'envoi des données.');
  }
}

async function validateAndGeneratePDF() {
  if (!validateForm()) {
    showToast('Veuillez corriger les erreurs en rouge avant de télécharger.');
    return;
  }

  const formData = getFormData();
  storage.set('lastInscription', formData); // sauvegarde locale

  await sendToGoogleSheets(formData);

  // Génération PDF (identique à l'original)
  const element = document.getElementById('inscription-section');
  const clone = element.cloneNode(true);
  const paper = clone.querySelector('.inscription-paper');
  paper.classList.add('pdf-light-mode', 'pdf-compact');

  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = '0';
  tempDiv.style.left = '0';
  tempDiv.style.opacity = '0';
  tempDiv.style.pointerEvents = 'none';
  tempDiv.appendChild(clone);
  document.body.appendChild(tempDiv);

  await new Promise(resolve => setTimeout(resolve, 200));

  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: `${formData.nom}_fiche_inscription.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(clone).save();
    showToast('PDF généré avec succès !');
  } catch (err) {
    console.error(err);
    showToast('Erreur lors de la génération du PDF.');
  } finally {
    document.body.removeChild(tempDiv);
  }
}
