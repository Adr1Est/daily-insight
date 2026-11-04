import type { BugType } from "@/types/bug";

// Bugs reales y documentados, para desarrollar la UI sin base de datos (DATA_SOURCE=mock).
// Ordenados del más antiguo (id 1) al más reciente (id 12).
const entries: Omit<BugType, "id" | "day" | "month" | "year" | "createdAt">[] = [
  {
    game: "Space Invaders",
    platform: "Arcade",
    bugYear: 1978,
    data: "El procesador de la recreativa no podía mover a los 55 invasores a la vez con fluidez, así que cuantos menos quedaban en pantalla, más rápido se desplazaban. Tomohiro Nishikado decidió conservar ese efecto en lugar de corregirlo, y la aceleración final se convirtió en la primera curva de dificultad dinámica de la historia del videojuego.",
  },
  {
    game: "Pac-Man",
    platform: "Arcade",
    bugYear: 1980,
    data: "Al llegar al nivel 256, el contador de fases (un único byte) se desborda y la rutina que dibuja las frutas escribe basura en la mitad derecha del laberinto. Esa mitad queda cubierta de letras y símbolos sin sentido y no se pueden comer todos los puntos, así que el nivel es imposible de completar. Es la famosa «pantalla de la muerte».",
  },
  {
    game: "Donkey Kong",
    platform: "Arcade",
    bugYear: 1981,
    data: "En el nivel 22 el temporizador de bonificación se calcula con una fórmula que desborda y arranca en apenas 400 puntos. Mario muere unos siete segundos después de empezar, sin tiempo para llegar arriba, así que ninguna partida puede pasar de ahí. Durante décadas, la carrera por el récord mundial consistió en llegar lo más lejos posible antes de esa pantalla.",
  },
  {
    game: "Super Mario Bros.",
    platform: "NES",
    bugYear: 1985,
    data: "En el nivel 1-2, si Mario atraviesa la pared de ladrillo junto a la tubería de salida en el momento justo, las tuberías de warp lo llevan al «Mundo -1». Es un nivel acuático que se repite sin fin, porque su tubería final devuelve a Mario al principio. En realidad es el mundo 36 mal leído: el carácter del 36 coincide con un espacio en blanco en el marcador.",
  },
  {
    game: "Tetris",
    platform: "NES",
    bugYear: 1989,
    data: "El Tetris de Nintendo nunca se diseñó para pasar del nivel 29. A partir del nivel 155 aparecen colores con datos corruptos, y en algunas combinaciones el juego se cuelga al completar una línea. En diciembre de 2023, Willis «Blue Scuti» Gibson, de 13 años, fue la primera persona en provocar ese cuelgue a propósito, 34 años después del lanzamiento.",
  },
  {
    game: "Pokémon Rojo y Azul",
    platform: "Game Boy",
    bugYear: 1996,
    data: "Si el jugador habla con el anciano de Ciudad Verde, vuela a Isla Canela y surfea por la costa este, el juego usa los datos de su nombre como tabla de encuentros salvajes. Así aparece MissingNo., un Pokémon con el sprite corrupto que multiplica el sexto objeto de la mochila y estropea los gráficos del Salón de la Fama.",
  },
  {
    game: "Super Mario 64",
    platform: "Nintendo 64",
    bugYear: 1996,
    data: "El juego limita la velocidad hacia delante de Mario, pero no la velocidad hacia atrás. Encadenando saltos largos de espaldas en las escaleras infinitas, Mario acumula velocidad sin límite hasta atravesar la puerta que exige 70 estrellas. El «Backwards Long Jump» o BLJ permite terminar el juego con muchas menos estrellas de las previstas.",
  },
  {
    game: "The Legend of Zelda: Ocarina of Time",
    platform: "Nintendo 64",
    bugYear: 1998,
    data: "Si Link muere o sale de una escena en un fotograma muy concreto mientras se carga una cinemática, el juego conserva un índice de destino incorrecto y lo teletransporta a otro lugar. Con este «wrong warp», los speedrunners saltan directamente al final del juego y lo completan en menos de diez minutos.",
  },
  {
    game: "World of Warcraft",
    platform: "PC",
    bugYear: 2005,
    data: "El jefe Hakkar lanzaba «Sangre corrupta», un debuff contagioso pensado para quedarse dentro de la banda. Las mascotas de los cazadores lo sacaban fuera al ser invocadas de nuevo, y la enfermedad arrasó las ciudades de varios servidores. Epidemiólogos reales estudiaron después el incidente como modelo del comportamiento humano ante una pandemia.",
  },
  {
    game: "Fallout 3",
    platform: "PC, PS3, Xbox 360",
    bugYear: 2008,
    data: "El motor no admitía vehículos, así que el metro que aparece en la expansión Broken Steel es en realidad un casco gigante en la cabeza de un personaje invisible que corre por las vías. Si el personaje se atasca o lo empujas, el «tren» se mueve de formas imposibles. Es un apaño de desarrollo que los jugadores descubrieron husmeando en los archivos.",
  },
  {
    game: "The Elder Scrolls V: Skyrim",
    platform: "PC, PS3, Xbox 360",
    bugYear: 2011,
    data: "El golpe de maza de los gigantes aplica una fuerza física desproporcionada al jugador. En lugar de derribarlo, lo lanza cientos de metros por los aires y suele matarlo al caer. Bethesda nunca lo corrigió del todo: el «vuelo de gigante» se convirtió en un meme y en una forma de viajar rápido por el mapa para los más atrevidos.",
  },
  {
    game: "Assassin's Creed Unity",
    platform: "PC, PS4, Xbox One",
    bugYear: 2014,
    data: "En el lanzamiento, un error al cargar las texturas hacía que algunos personajes aparecieran sin piel: solo se veían los ojos y la dentadura, flotando sobre un modelo vacío. La imagen se hizo viral y se convirtió en el símbolo de un estreno lleno de fallos que obligó a Ubisoft a publicar varios parches grandes y a compensar a los compradores.",
  },
];

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Las fechas se calculan hacia atrás desde hoy, así el último mock siempre es «el bug del día».
export function getMockInsights(): BugType[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return entries.map((entry, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (entries.length - 1 - index));
    return {
      ...entry,
      id: index + 1,
      day: date.getDate(),
      month: MONTHS[date.getMonth()],
      year: date.getFullYear(),
      createdAt: date,
    };
  });
}
