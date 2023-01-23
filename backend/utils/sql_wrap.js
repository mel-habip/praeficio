export default function sql_wrap(value) {
    return (value != null) ? `"${value}"` : "NULL";
}