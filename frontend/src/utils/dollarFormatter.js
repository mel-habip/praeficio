export default function dollarFormatter(v) {
    if (isNaN(v)) return v;
    if (typeof v === 'string') v = parseInt(v);

    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD'
    }).format(v);
}