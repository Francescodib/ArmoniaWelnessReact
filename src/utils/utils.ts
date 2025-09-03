export const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Funzione per formattare una data in formato YYYY-MM-DD senza problemi di fuso orario
export const formatDateToISOString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Funzione per creare una data da una stringa YYYY-MM-DD senza problemi di fuso orario
export const createDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};