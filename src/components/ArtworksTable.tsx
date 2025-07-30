import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import { ChevronDown } from "lucide-react";

type Artwork = {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
};

const ArtworksTable = () => {
  const [value, setValue] = useState<Artwork[]>([]);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  const [selectCount, setSelectCount] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const op = useRef<OverlayPanel>(null);

  const fetchData = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber + 1}`
      );
      setValue(res.data.data);
      setTotalRecords(res.data.pagination.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  useEffect(() => {
    const count = parseInt(selectCount);
    if (!isNaN(count) && count > selectedRows.length) {
      const remaining = count - selectedRows.length;
      const newSelections = value
        .filter((artwork) => !selectedRows.some((row) => row.id === artwork.id))
        .slice(0, remaining);
      setSelectedRows((prev) => [...prev, ...newSelections]);
    }
  }, [value]);

  const handleRowSelection = () => {
    const count = parseInt(selectCount);
    if (!isNaN(count) && count >= 0) {
      const newSelection = value
        .filter((artwork) => !selectedRows.some((row) => row.id === artwork.id))
        .slice(0, count);
      setSelectedRows(newSelection);
      op.current?.hide();
    }
  };

  const handleOverlayToggle = (
    event: React.MouseEvent<SVGElement, MouseEvent>
  ) => {
    op.current?.toggle(event);
  };

  return (
    <div>
      <OverlayPanel ref={op}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "20px 30px",
          }}
        >
          <label>Enter number of rows to select:</label>
          <InputText
            inputMode="numeric"
            pattern="[0-9]*"
            value={selectCount}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) setSelectCount(val);
            }}
            style={{ padding: "6px" }}
          />
          <Button label="Submit" onClick={handleRowSelection} />
        </div>
      </OverlayPanel>

      <DataTable
        value={value}
        loading={loading}
        paginator
        first={page * 12}
        rows={12}
        totalRecords={totalRecords}
        onPage={(e) => setPage(e.page ?? 0)}
        lazy
        selection={selectedRows}
        onSelectionChange={(e: { value: Artwork[] }) =>
          setSelectedRows(e.value)
        }
        dataKey="id"
        emptyMessage="No artworks found"
        selectionMode="multiple"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column
          field="title"
          header={
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ChevronDown
                size={20}
                onClick={handleOverlayToggle}
                className="mb-3 cursor-pointer"
              />
              Title
            </span>
          }
          body={(rowData) => rowData.title || "null"}
        />
        <Column
          field="place_of_origin"
          header="Origin"
          body={(rowData) => rowData.place_of_origin || "null"}
        />
        <Column
          field="artist_display"
          header="Artist"
          body={(rowData) => rowData.artist_display || "null"}
        />
        <Column
          field="inscriptions"
          header="Inscriptions"
          body={(rowData) => rowData.inscriptions || "null"}
        />
        <Column
          field="date_start"
          header="Start Date"
          body={(rowData) => rowData.date_start || "null"}
        />
        <Column
          field="date_end"
          header="End Date"
          body={(rowData) => rowData.date_end || "null"}
        />
      </DataTable>
    </div>
  );
};

export default ArtworksTable;
