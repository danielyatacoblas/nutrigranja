import React from "react";

interface Column {
  header: string;
  accessor: string;
  cell?: (value: any, row: any) => React.ReactNode;
  width?: string; // Añadimos la propiedad width para controlar el ancho de las columnas
}

interface TableProps {
  columns: Column[];
  data: any[];
  className?: string;
}

export default function Table({ columns, data, className }: TableProps) {
  if (!data || data.length === 0) {
    return <div className="text-center p-4">No hay datos para mostrar</div>;
  }

  return (
    <table className={`w-full text-left ${className}`}>
      <thead>
        <tr className="bg-gray-100">
          {columns.map((col) => (
            <th key={col.accessor} className="p-2" style={{ width: col.width }}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b">
            {columns.map((col) => (
              <td key={col.accessor} className="p-2">
                {col.cell
                  ? col.cell(row[col.accessor], row)
                  : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
