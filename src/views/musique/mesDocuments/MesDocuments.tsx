// styles
import "./mesDocuments.scss";

// hooks | libraries
import { ReactElement, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import {
  MdArrowBack,
  MdDownload,
  MdEdit,
  MdDelete,
  MdSearch,
  MdNavigateNext,
  MdNavigateBefore,
  MdStar,
  MdStarBorder,
  MdFilterList,
  MdFilterListOff,
  MdUploadFile,
  MdCancel,
} from "react-icons/md";
import { GiFiles } from "react-icons/gi";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import Button from "../../../components/button/Button.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Loader from "../../../components/loader/Loader.tsx";

// hooks
import { useMusicDocument } from "../../../hooks/useMusicDocument.ts";

// utils
import { showErrorNotification } from "../../../utils/scripts/errorHandling.ts";
import { confirm, showSuccess, showError } from "../../../utils/services/alertService";

// types
import { IMusicDocument, MusicDocumentType } from "../../../utils/types/musicDocument.types.ts";

type DocumentTypeOption = { value: MusicDocumentType; label: string };
type FilterTypeOption = { value: MusicDocumentType | ""; label: string };

const DOCUMENT_TYPE_LABELS: Record<MusicDocumentType, string> = {
  partition: "Partition",
  grille_accords: "Grille d'accords",
  tab: "Tablature",
  paroles: "Paroles",
  theorie: "Théorie",
  autre: "Autre",
};

const DOCUMENT_TYPE_OPTIONS: DocumentTypeOption[] = Object.entries(DOCUMENT_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as MusicDocumentType, label })
);

const FILTER_TYPE_OPTIONS: FilterTypeOption[] = [
  { value: "", label: "Tous les types" },
  ...DOCUMENT_TYPE_OPTIONS,
];

function MesDocuments(): ReactElement {
  const navigate = useNavigate();
  const {
    documents,
    pagination,
    isLoading,
    getAllDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    toggleFavorite,
    searchDocuments,
  } = useMusicDocument();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<MusicDocumentType | "">("");
  const [filterFavorite, setFilterFavorite] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [uploadModal, setUploadModal] = useState<{ visible: boolean }>({ visible: false });
  const [editModal, setEditModal] = useState<{ visible: boolean; document: IMusicDocument | null }>({
    visible: false,
    document: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    type: MusicDocumentType | "";
    customFileName: string;
    description: string;
  }>({
    title: "",
    type: "",
    customFileName: "",
    description: "",
  });

  useEffect(() => {
    if (searchTerm.trim() && searchTerm.trim().length >= 3) {
      searchDocumentsLocal();
    } else if (!searchTerm.trim()) {
      loadDocuments(currentPage);
    }
  }, [currentPage, searchTerm, filterType, filterFavorite]);

  const loadDocuments = async (page: number, limit: number = 10) => {
    try {
      await getAllDocuments({
        page,
        limit,
        filterType: filterType || undefined,
        filterFavorite: filterFavorite || undefined,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des documents:", error);
      showErrorNotification("Erreur lors du chargement des documents");
    }
  };

  const searchDocumentsLocal = async () => {
    try {
      await searchDocuments({
        query: searchTerm,
        page: currentPage,
        limit: 10,
      });
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      showErrorNotification("Erreur lors de la recherche de documents");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if (!newSearchTerm.trim() && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      showError("Erreur", "Veuillez sélectionner un fichier");
      return;
    }

    if (!formData.title || !formData.type) {
      showError("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await uploadDocument(selectedFile, {
        title: formData.title,
        type: formData.type as MusicDocumentType,
        customFileName: formData.customFileName || undefined,
        description: formData.description || undefined,
      });

      showSuccess("Succès", "Document uploadé avec succès");
      setUploadModal({ visible: false });
      resetForm();
      loadDocuments(currentPage);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      showError("Erreur", "Erreur lors de l'upload du document");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editModal.document) return;

    try {
      await updateDocument(editModal.document.id, {
        title: formData.title,
        type: formData.type as MusicDocumentType,
        description: formData.description || undefined,
      });

      showSuccess("Succès", "Document mis à jour avec succès");
      setEditModal({ visible: false, document: null });
      resetForm();
      loadDocuments(currentPage);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      showError("Erreur", "Erreur lors de la mise à jour du document");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm(
      "Supprimer le document",
      "Êtes-vous sûr de vouloir supprimer ce document ?"
    );

    if (confirmed) {
      try {
        await deleteDocument(id);
        showSuccess("Succès", "Document supprimé avec succès");
        loadDocuments(currentPage);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showError("Erreur", "Erreur lors de la suppression du document");
      }
    }
  };

  const handleDownload = async (doc: IMusicDocument) => {
    try {
      const blob = await downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      showError("Erreur", "Erreur lors du téléchargement du document");
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      await toggleFavorite(id);
      loadDocuments(currentPage);
    } catch (error) {
      console.error("Erreur lors du toggle favori:", error);
      showError("Erreur", "Erreur lors de la mise à jour du favori");
    }
  };

  const openEditModal = (doc: IMusicDocument) => {
    setFormData({
      title: doc.title,
      type: doc.type,
      customFileName: "",
      description: doc.description || "",
    });
    setEditModal({ visible: true, document: doc });
  };

  const resetForm = () => {
    setFormData({ title: "", type: "", customFileName: "", description: "" });
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="mes-documents">
        <div className="documentsContainer">

          <section className="documentsHeader">
            <Button style="musiqueBack" onClick={() => navigate("/musique")}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1 className="documentsTitle">Mes Documents</h1>
            <Button style="musiqueBack" onClick={() => setUploadModal({ visible: true })}>
              <MdUploadFile />
              <span>Uploader</span>
            </Button>
          </section>

          <section className="documentsControls">
            <div className="searchBar">
              <MdSearch />
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button
              type="button"
              className={`filterToggle ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <MdFilterListOff /> : <MdFilterList />}
              <span>{showFilters ? "Masquer" : "Filtres"}</span>
            </button>
          </section>

          {showFilters && (
            <section className="documentsFilters">
              <div className="filterGroup">
                <label>Type</label>
                <Select
                  value={FILTER_TYPE_OPTIONS.find((opt) => opt.value === filterType) ?? FILTER_TYPE_OPTIONS[0]}
                  onChange={(option: FilterTypeOption | null) =>
                    setFilterType(option ? option.value : "")
                  }
                  options={FILTER_TYPE_OPTIONS}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isSearchable={false}
                />
              </div>
              <div className="filterGroup filterGroupCheckbox">
                <label>
                  <input
                    type="checkbox"
                    checked={filterFavorite}
                    onChange={(e) => setFilterFavorite(e.target.checked)}
                  />
                  Favoris uniquement
                </label>
              </div>
            </section>
          )}

          {isLoading ? (
            <Loader />
          ) : (
            <>
              <section className="documentsList">
                {documents.length === 0 ? (
                  <div className="emptyState">
                    <GiFiles />
                    <p>Aucun document trouvé</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="documentCard">
                      <div className="documentHeader">
                        <div className="documentInfo">
                          <h3 className="documentTitle">{doc.title}</h3>
                          <div className="documentMeta">
                            <span className="documentType">{DOCUMENT_TYPE_LABELS[doc.type]}</span>
                            <span className="documentSize">{formatFileSize(doc.fileSize)}</span>
                          </div>
                          {doc.description && (
                            <p className="documentDescription">{doc.description}</p>
                          )}
                        </div>
                        <div className="documentActions">
                          <button
                            type="button"
                            className={`actionBtn favoriteBtn ${doc.isFavorite ? "active" : ""}`}
                            onClick={() => handleToggleFavorite(doc.id)}
                            title={doc.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                          >
                            {doc.isFavorite ? <MdStar /> : <MdStarBorder />}
                          </button>
                          <button
                            type="button"
                            className="actionBtn downloadBtn"
                            onClick={() => handleDownload(doc)}
                            title="Télécharger"
                          >
                            <MdDownload />
                          </button>
                          <button
                            type="button"
                            className="actionBtn editBtn"
                            onClick={() => openEditModal(doc)}
                            title="Modifier"
                          >
                            <MdEdit />
                          </button>
                          <button
                            type="button"
                            className="actionBtn deleteBtn"
                            onClick={() => handleDelete(doc.id)}
                            title="Supprimer"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </section>

              {pagination && pagination.totalPages > 1 && (
                <section className="pagination">
                  <button
                    type="button"
                    className="paginationBtn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <MdNavigateBefore />
                  </button>
                  <span className="pageInfo">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    className="paginationBtn"
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <MdNavigateNext />
                  </button>
                </section>
              )}
            </>
          )}
        </div>

        {/* Upload Modal */}
      <Modal
        isVisible={uploadModal.visible}
        onClose={() => {
          setUploadModal({ visible: false });
          resetForm();
        }}
        title="Uploader un document"
      >
        <form onSubmit={handleUploadSubmit} className="documentForm">
          <div className="formField">
            <label className="formLabel">
              Fichier <span className="required">*</span>
            </label>
            <div
              className={`uploadZone ${selectedFile ? "hasFile" : ""}`}
              onClick={() => document.getElementById("doc-file-input")?.click()}
            >
              <input
                type="file"
                id="doc-file-input"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt,.mxl,.xml,.gp3,.gp4,.gp5,.gp6,.gp7,.mid,.midi"
                hidden
              />
              {selectedFile ? (
                <div className="fileInfo">
                  <MdUploadFile className="fileIcon" />
                  <div className="fileDetails">
                    <span className="fileName">{selectedFile.name}</span>
                    <span className="fileSize">{formatFileSize(selectedFile.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="removeFile"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    <MdCancel />
                  </button>
                </div>
              ) : (
                <div className="uploadPrompt">
                  <MdUploadFile className="uploadIcon" />
                  <span className="primaryText">Cliquez pour sélectionner</span>
                  <span className="secondaryText">
                    PDF, Image, Word, MusicXML, Guitar Pro, MIDI · max 50MB
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="formField">
            <label className="formLabel">
              Titre <span className="required">*</span>
            </label>
            <input
              type="text"
              className="formInput"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex : Bohemian Rhapsody - Partition"
              required
            />
          </div>

          <div className="formField">
            <label className="formLabel">
              Type <span className="required">*</span>
            </label>
            <Select
              value={DOCUMENT_TYPE_OPTIONS.find((opt) => opt.value === formData.type) ?? null}
              onChange={(option: DocumentTypeOption | null) =>
                setFormData({ ...formData, type: option ? option.value : "" })
              }
              options={DOCUMENT_TYPE_OPTIONS}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Sélectionner un type..."
              isSearchable={false}
            />
          </div>

          <div className="formField">
            <label className="formLabel">Nom personnalisé du fichier</label>
            <input
              type="text"
              className="formInput"
              value={formData.customFileName}
              onChange={(e) => setFormData({ ...formData, customFileName: e.target.value })}
              placeholder="Laisser vide pour utiliser le nom original"
            />
          </div>

          <div className="formField">
            <label className="formLabel">Description</label>
            <textarea
              className="formInput"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Notes ou commentaires optionnels..."
            />
          </div>

          <div className="formActions">
            <Button
              style="grey"
              onClick={() => {
                setUploadModal({ visible: false });
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button style="musiqueBack" type="submit">
              Uploader
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isVisible={editModal.visible}
        onClose={() => {
          setEditModal({ visible: false, document: null });
          resetForm();
        }}
        title="Modifier le document"
      >
        <form onSubmit={handleEditSubmit} className="documentForm">
          <div className="formField">
            <label className="formLabel">
              Titre <span className="required">*</span>
            </label>
            <input
              type="text"
              className="formInput"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="formField">
            <label className="formLabel">
              Type <span className="required">*</span>
            </label>
            <Select
              value={DOCUMENT_TYPE_OPTIONS.find((opt) => opt.value === formData.type) ?? null}
              onChange={(option: DocumentTypeOption | null) =>
                setFormData({ ...formData, type: option ? option.value : "" })
              }
              options={DOCUMENT_TYPE_OPTIONS}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Sélectionner un type..."
              isSearchable={false}
            />
          </div>

          <div className="formField">
            <label className="formLabel">Description</label>
            <textarea
              className="formInput"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="formActions">
            <Button
              style="grey"
              onClick={() => {
                setEditModal({ visible: false, document: null });
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button style="musiqueBack" type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
      </main>
    </>
  );
}

const MesDocumentsWithAuth = WithAuth(MesDocuments);
export default MesDocumentsWithAuth;
