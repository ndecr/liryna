// styles
import "./budgetEdit.scss";

// hooks | libraries
import { ReactElement, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { StylesConfig } from "react-select";
import { IoAdd, IoTrash, IoSave } from "react-icons/io5";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";

// context
import { BudgetContext } from "../../../context/budget/BudgetContext.tsx";

// types
import {
  IBudgetEntryFormData,
  IBudgetDebtFormData,
  BudgetSection,
} from "../../../utils/types/budget.types.ts";

const REVENUS_CATEGORIES = ["Salaires", "Allocations et aides"];
const CHARGES_FIXES_CATEGORIES = [
  "Logement", "Energie", "Internet & Telephones",
  "Assurances", "Abonnements", "Autres",
];

interface EntryRow extends IBudgetEntryFormData {
  tempId: string;
}

interface DebtRow extends IBudgetDebtFormData {
  tempId: string;
}

interface SelectOption {
  value: number;
  label: string;
}

const personnesOptions: SelectOption[] = Array.from({ length: 20 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1),
}));

const budgetSelectStyles: StylesConfig<SelectOption, false> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '44px',
    height: '44px',
    border: state.isFocused
      ? '2px solid #ff6b47'
      : '2px solid #e0e7ff',
    borderRadius: '8px',
    boxShadow: state.isFocused
      ? '0 0 0 3px rgba(255, 107, 71, 0.2)'
      : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#ff6b47' : '#c7d2fe',
    },
    fontSize: '1em',
    fontFamily: 'inherit',
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '40px',
    padding: '0 0.75em',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '40px',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af',
  }),
  input: (provided) => ({
    ...provided,
    color: '#374151',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#374151',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
    zIndex: 9999,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '4px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#ff6b47'
      : state.isFocused
        ? '#fff3f0'
        : 'white',
    color: state.isSelected ? 'white' : '#374151',
    borderRadius: '6px',
    margin: '2px 0',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: state.isSelected ? '#ff6b47' : '#ffe8e2',
    },
  }),
};

let tempIdCounter = 0;
const generateTempId = (): string => `temp_${++tempIdCounter}`;

function BudgetEdit(): ReactElement {
  const navigate = useNavigate();
  const {
    currentBudget,
    getMyBudget,
    createBudget,
    updateBudget,
  } = useContext(BudgetContext);

  const [nombrePersonnes, setNombrePersonnes] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Charger le budget existant
  useEffect(() => {
    const loadBudget = async () => {
      setIsLoading(true);
      try {
        await getMyBudget();
      } catch {
        // Budget n'existe pas, mode creation
      } finally {
        setIsLoading(false);
      }
    };
    loadBudget();
  }, [getMyBudget]);

  // Peupler le formulaire si budget charge
  useEffect(() => {
    if (currentBudget) {
      setEditMode(true);
      setNombrePersonnes(currentBudget.nombrePersonnes);
      setNotes(currentBudget.notes || "");
      setEntries(
        currentBudget.entries.map((e) => ({
          tempId: generateTempId(),
          section: e.section,
          category: e.category || "",
          label: e.label,
          amount: e.amount,
          sortOrder: e.sortOrder,
        }))
      );
      setDebts(
        currentBudget.debts.map((d) => ({
          tempId: generateTempId(),
          type: d.type,
          organisme: d.organisme,
          mensualite: d.mensualite,
          sortOrder: d.sortOrder,
        }))
      );
    }
  }, [currentBudget]);

  const addEntry = useCallback((section: BudgetSection, category: string = "") => {
    setEntries((prev) => [
      ...prev,
      {
        tempId: generateTempId(),
        section,
        category,
        label: "",
        amount: 0,
        sortOrder: prev.filter((e) => e.section === section).length,
      },
    ]);
  }, []);

  const removeEntry = useCallback((tempId: string) => {
    setEntries((prev) => prev.filter((e) => e.tempId !== tempId));
  }, []);

  const updateEntry = useCallback(
    (tempId: string, field: keyof IBudgetEntryFormData, value: string | number) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.tempId === tempId ? { ...e, [field]: value } : e
        )
      );
    },
    []
  );

  const addDebt = useCallback(() => {
    setDebts((prev) => [
      ...prev,
      {
        tempId: generateTempId(),
        type: "",
        organisme: "",
        mensualite: 0,
        sortOrder: prev.length,
      },
    ]);
  }, []);

  const removeDebt = useCallback((tempId: string) => {
    setDebts((prev) => prev.filter((d) => d.tempId !== tempId));
  }, []);

  const updateDebt = useCallback(
    (tempId: string, field: keyof IBudgetDebtFormData, value: string | number) => {
      setDebts((prev) =>
        prev.map((d) =>
          d.tempId === tempId ? { ...d, [field]: value } : d
        )
      );
    },
    []
  );

  // Calculs en temps reel
  const totalBySection = (section: BudgetSection): number =>
    entries
      .filter((e) => e.section === section)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const totalRevenus = totalBySection("revenus");
  const totalChargesFixes = totalBySection("charges_fixes");
  const totalChargesVariables = totalBySection("charges_variables");
  const totalDettes = debts.reduce((sum, d) => sum + Number(d.mensualite || 0), 0);
  const totalCharges = totalChargesFixes + totalChargesVariables + totalDettes;
  const resteAVivre = totalRevenus - totalCharges;

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = {
        nombrePersonnes,
        notes,
        entries: entries.map((e, i) => ({
          section: e.section,
          category: e.category || "",
          label: e.label,
          amount: Number(e.amount),
          sortOrder: i,
        })),
        debts: debts.map((d, i) => ({
          type: d.type,
          organisme: d.organisme,
          mensualite: Number(d.mensualite),
          sortOrder: i,
        })),
      };

      if (editMode && currentBudget) {
        await updateBudget(currentBudget.id, formData);
        setSuccessMessage("Budget mis a jour avec succes");
      } else {
        await createBudget(formData);
        setSuccessMessage("Budget cree avec succes");
        setEditMode(true);
      }

      setTimeout(() => {
        navigate("/budget/dashboard");
      }, 1000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la sauvegarde";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const renderEntryRows = (section: BudgetSection, category?: string) => {
    const filtered = entries.filter(
      (e) => e.section === section && (category === undefined || e.category === category)
    );

    return filtered.map((entry) => (
      <div key={entry.tempId} className="entryRow">
        <input
          type="text"
          className="entryLabel"
          placeholder="Libelle"
          value={entry.label}
          onChange={(e) => updateEntry(entry.tempId, "label", e.target.value)}
        />
        <input
          type="number"
          className="entryAmount"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={entry.amount || ""}
          onChange={(e) => updateEntry(entry.tempId, "amount", parseFloat(e.target.value) || 0)}
        />
        <button
          type="button"
          className="removeBtn"
          onClick={() => removeEntry(entry.tempId)}
        >
          <IoTrash />
        </button>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <SubNav />
        <main id="budgetEdit">
          <div className="editContainer">
            <p className="loadingText">Chargement...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <SubNav />
      <main id="budgetEdit">
        <div className="editContainer">
          <section className="editHeader" data-aos="fade-down">
            <h1 className="editTitle">
              {editMode ? "Modifier le budget" : "Nouveau budget"}
            </h1>
          </section>

          {errorMessage && (
            <div className="messageBox error">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="messageBox success">{successMessage}</div>
          )}

          {/* Parametres */}
          <section className="formSection parametres" data-aos="fade-up">
            <h2 className="sectionTitle">Parametres</h2>
            <div className="paramsGrid">
              <div className="paramField">
                <label htmlFor="budgetPersonnes">Nombre de personnes</label>
                <Select<SelectOption>
                  inputId="budgetPersonnes"
                  value={personnesOptions.find((o) => o.value === nombrePersonnes)}
                  onChange={(opt) => opt && setNombrePersonnes(opt.value)}
                  options={personnesOptions}
                  styles={budgetSelectStyles}
                  isSearchable={false}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </div>
            <div className="paramField notes">
              <label htmlFor="budgetNotes">Notes</label>
              <textarea
                id="budgetNotes"
                placeholder="Notes optionnelles..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </section>

          {/* Revenus */}
          <section className="formSection revenus" data-aos="fade-up" data-aos-delay="100">
            <div className="sectionHeader">
              <h2 className="sectionTitle">Revenus</h2>
              <span className="sectionTotal">{formatCurrency(totalRevenus)}</span>
            </div>
            {REVENUS_CATEGORIES.map((cat) => (
              <div key={cat} className="categoryBlock">
                <h3 className="categoryTitle">{cat}</h3>
                {renderEntryRows("revenus", cat)}
                <button
                  type="button"
                  className="addBtn"
                  onClick={() => addEntry("revenus", cat)}
                >
                  <IoAdd /> Ajouter
                </button>
              </div>
            ))}
          </section>

          {/* Charges Fixes */}
          <section className="formSection chargesFixes" data-aos="fade-up" data-aos-delay="200">
            <div className="sectionHeader">
              <h2 className="sectionTitle">Charges fixes</h2>
              <span className="sectionTotal">{formatCurrency(totalChargesFixes)}</span>
            </div>
            {CHARGES_FIXES_CATEGORIES.map((cat) => (
              <div key={cat} className="categoryBlock">
                <h3 className="categoryTitle">{cat}</h3>
                {renderEntryRows("charges_fixes", cat)}
                <button
                  type="button"
                  className="addBtn"
                  onClick={() => addEntry("charges_fixes", cat)}
                >
                  <IoAdd /> Ajouter
                </button>
              </div>
            ))}
          </section>

          {/* Charges Variables */}
          <section className="formSection chargesVariables" data-aos="fade-up" data-aos-delay="300">
            <div className="sectionHeader">
              <h2 className="sectionTitle">Charges variables</h2>
              <span className="sectionTotal">{formatCurrency(totalChargesVariables)}</span>
            </div>
            {renderEntryRows("charges_variables")}
            <button
              type="button"
              className="addBtn"
              onClick={() => addEntry("charges_variables")}
            >
              <IoAdd /> Ajouter une charge variable
            </button>
          </section>

          {/* Dettes */}
          <section className="formSection dettes" data-aos="fade-up" data-aos-delay="400">
            <div className="sectionHeader">
              <h2 className="sectionTitle">Dettes</h2>
              <span className="sectionTotal">{formatCurrency(totalDettes)}/mois</span>
            </div>
            {debts.map((debt) => (
              <div key={debt.tempId} className="debtRow">
                <div className="debtFields">
                  <input
                    type="text"
                    placeholder="Type (ex: Credit immo)"
                    value={debt.type}
                    onChange={(e) => updateDebt(debt.tempId, "type", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Organisme"
                    value={debt.organisme}
                    onChange={(e) => updateDebt(debt.tempId, "organisme", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Mensualite"
                    step="0.01"
                    min="0"
                    value={debt.mensualite || ""}
                    onChange={(e) => updateDebt(debt.tempId, "mensualite", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <button
                  type="button"
                  className="removeBtn"
                  onClick={() => removeDebt(debt.tempId)}
                >
                  <IoTrash />
                </button>
              </div>
            ))}
            <button type="button" className="addBtn" onClick={addDebt}>
              <IoAdd /> Ajouter une dette
            </button>
          </section>

          {/* Resume */}
          <section className="formSection resume" data-aos="fade-up" data-aos-delay="500">
            <div className="resumeGrid">
              <div className="resumeRow">
                <span>Total revenus</span>
                <span className="positive">{formatCurrency(totalRevenus)}</span>
              </div>
              <div className="resumeRow">
                <span>Total charges</span>
                <span className="negative">{formatCurrency(totalCharges)}</span>
              </div>
              <div className={`resumeRow total ${resteAVivre >= 0 ? "positive" : "negative"}`}>
                <span>Reste a vivre</span>
                <span>{formatCurrency(resteAVivre)}</span>
              </div>
              {nombrePersonnes > 1 && (
                <div className="resumeRow detail">
                  <span>Par personne ({nombrePersonnes})</span>
                  <span>{formatCurrency(resteAVivre / nombrePersonnes)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <section className="formActions" data-aos="fade-up" data-aos-delay="600">
            <button
              type="button"
              className="cancelBtn"
              onClick={() => navigate("/budget")}
            >
              Annuler
            </button>
            <button
              type="button"
              className="saveBtn"
              onClick={handleSave}
              disabled={isSaving}
            >
              <IoSave />
              <span>{isSaving ? "Sauvegarde..." : "Sauvegarder"}</span>
            </button>
          </section>
        </div>
      </main>
    </>
  );
}

const BudgetEditWithAuth = WithAuth(BudgetEdit);
export default BudgetEditWithAuth;
