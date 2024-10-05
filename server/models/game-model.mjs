import dayjs from 'dayjs';

export default function Gameplay(id_gameplay, id_utente,punteggio, id_round1, id_round2, id_round3, data) {
    this.id_gameplay = id_gameplay;
    this.id_utente = id_utente;
    this.punteggio = punteggio;
    this.id_round1 = id_round1;
    this.id_round2 = id_round2;
    this.id_round3 = id_round3;
    this.data = dayjs(data).format('YYYY-MM-DD HH:mm');
}
