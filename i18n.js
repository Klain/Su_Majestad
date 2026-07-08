const UI_TEXT = {
  page: {
    title: "Su Majestad - Roguelike de Reino"
  },
  menu: {
    eyebrow: "Roguelike de gestión",
    title: "Su Majestad",
    subtitle: "Cada reinado es una run de decisiones, memoria y consecuencias.",
    versionAria: "Versión actual del juego",
    versionPrefix: "Versión",
    continue: "Continuar reinado",
    newRun: "Nuevo reinado",
    developerMode: "Modo desarrollador",
    deleteSave: "Borrar partida"
  },
  setup: {
    eyebrow: "Nueva partida",
    title: "Forja tu monarca",
    intro: "Elige un rasgo inicial, una ambición y la religión del reino. La corte juzgará tu reinado por los tres.",
    trait: "Rasgo del monarca",
    ambition: "Ambición",
    religion: "Religión del reino",
    start: "Comenzar reinado",
    back: "Volver al menú"
  },
  game: {
    eyebrow: "Roguelike de gestión",
    title: "Su Majestad",
    versionAria: "Versión actual del juego",
    versionPrefix: "Versión",
    menu: "Menú",
    day: "Día",
    campaignLength: "de 30",
    progressAria: "Progreso de la campaña",
    resourcesAria: "Recursos del reino",
    reignAria: "Reinado actual",
    traitEvolutionAria: "Evolución del rasgo",
    edictOfferAria: "Oferta de edictos",
    newsAria: "Noticias del reino",
    memoryAria: "Memoria del reino",
    issuesAria: "Crisis abiertas del reino",
    councilTitle: "Consejo del día",
    councilSubtitle: "Resuelve los 2 asuntos antes de cerrar la jornada.",
    endDay: "Terminar día"
  },
  developer: {
    eyebrow: "Modo desarrollador",
    title: "Base de datos visual de contenido",
    intro: "Editor compacto inspirado en RPG Maker MV: eventos, familias, subfamilias y actores se editan en memoria, con exportación versionada y borrador local.",
    back: "Volver al menú",
    export: "Exportar base de datos",
    import: "Importar base de datos",
    draft: "Guardar borrador",
    loadDraft: "Cargar borrador",
    validate: "Validar todo"
  }
};

function getUiText(path) {
  return path.split(".").reduce((value, key) => value?.[key], UI_TEXT) || "";
}

function applyUiTranslations(root = document) {
  document.title = UI_TEXT.page.title;
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = getUiText(element.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", getUiText(element.dataset.i18nAria));
  });
}

document.addEventListener("DOMContentLoaded", () => applyUiTranslations());
