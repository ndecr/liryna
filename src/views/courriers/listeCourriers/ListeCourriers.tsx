// styles
import "./listeCourriers.scss";

// hooks | libraries
import { ReactElement, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MdArrowBack, 
  MdDownload, 
  MdEdit, 
  MdDelete, 
  MdEmail, 
  MdSearch,
  MdNavigateNext,
  MdNavigateBefore,
  MdVisibility
} from "react-icons/md";
import { FiFileText } from "react-icons/fi";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import Button from "../../../components/button/Button.tsx";
import Modal from "../../../components/modal/Modal.tsx";
import Loader from "../../../components/loader/Loader.tsx";

// context
import { CourrierContext } from "../../../context/courrier/CourrierContext.tsx";

// services
import { downloadCourrierService } from "../../../API/services/courrier.service.ts";

// types
import { ICourrier } from "../../../utils/types/courrier.types.ts";

function ListeCourriers(): ReactElement {
  const navigate = useNavigate();
  const { courriers, pagination, getAllCourriers, downloadCourrier, deleteCourrier, isLoading } = useContext(CourrierContext);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({
    visible: false,
    content: "",
    x: 0,
    y: 0
  });
  const [pdfModal, setPdfModal] = useState<{ visible: boolean; pdfUrl: string; fileName: string; fileType: 'pdf' | 'image' }>({
    visible: false,
    pdfUrl: "",
    fileName: "",
    fileType: 'pdf'
  });

  useEffect(() => {
    if (searchTerm.trim()) {
      // Si recherche active, charger tous les courriers
      loadCourriers(1, 1000); // Charge un grand nombre pour avoir tous les courriers
    } else {
      // Si pas de recherche, pagination normale - revenir à la page 1 si on était en recherche
      loadCourriers(currentPage);
    }
  }, [currentPage, searchTerm]);

  // Gérer le changement de terme de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    // Si on passe de recherche à pas de recherche, revenir à la page 1
    if (!newSearchTerm.trim() && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const loadCourriers = async (page: number, limit: number = 10) => {
    try {
      await getAllCourriers(page, limit);
    } catch (error) {
      // Error handling via context
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleBackClick = () => {
    navigate("/utils/mail");
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getDirectionBadge = (direction: string): string => {
    switch (direction) {
      case 'entrant': return 'badge-entrant';
      case 'sortant': return 'badge-sortant'; 
      case 'interne': return 'badge-interne';
      default: return '';
    }
  };

  const handleDownload = async (courrierid: number) => {
    try {
      const blob = await downloadCourrier(courrierid);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'courrier.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Erreur lors du téléchargement du courrier');
    }
  };

  const handleEdit = (courrierid: number) => {
    navigate(`/utils/mail/update/${courrierid}`);
  };

  const handleEmail = (_courrierid: number) => {
    // TODO: Ouvrir une modal pour envoyer par email
  };

  const handleDelete = async (courrierid: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce courrier ?')) {
      try {
        await deleteCourrier(courrierid);
        loadCourriers(currentPage);
      } catch (error) {
        alert('Erreur lors de la suppression du courrier');
      }
    }
  };

  const handleViewPdf = async (courrier: ICourrier) => {
    try {
      // Utiliser directement le service au lieu du context pour éviter les re-renders
      const blob = await downloadCourrierService(courrier.id);
      const pdfUrl = URL.createObjectURL(blob);
      
      // Détecter le type de fichier basé sur l'extension ou le type MIME du blob
      const isImage = blob.type.startsWith('image/') || 
                      courrier.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
      
      setPdfModal({
        visible: true,
        pdfUrl: pdfUrl,
        fileName: courrier.fileName,
        fileType: isImage ? 'image' : 'pdf'
      });
    } catch (error) {
      alert('Erreur lors du chargement du PDF pour visualisation');
    }
  };

  const closePdfModal = () => {
    // Nettoyer l'URL du blob pour éviter les fuites mémoire
    if (pdfModal.pdfUrl && pdfModal.pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfModal.pdfUrl);
    }
    setPdfModal({
      visible: false,
      pdfUrl: "",
      fileName: "",
      fileType: 'pdf'
    });
  };

  const handleMouseEnter = (event: React.MouseEvent, content: string) => {
    if (content && content !== "N/A" && content.length > 20) {
      setTooltip({
        visible: true,
        content: content,
        x: event.clientX + 10,
        y: event.clientY - 10
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltip.visible) {
      setTooltip(prev => ({
        ...prev,
        x: event.clientX + 10,
        y: event.clientY - 10
      }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip({
      visible: false,
      content: "",
      x: 0,
      y: 0
    });
  };

  const filteredCourriers = courriers.filter(courrier =>
    courrier.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courrier.kind?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courrier.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    courrier.emitter?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <SubNav />
      <main id="listeCourriers" className="listeCourrierMain">
        <div className="listeCourrierContainer">
          {/* Header */}
          <header className="listeCourrierHeader" data-aos="fade-down">
            <Button 
              style="back"
              onClick={handleBackClick}
              type="button"
            >
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1 className="pageTitle">Liste des courriers</h1>
          </header>

          {/* Search and Pagination */}
          <section className="searchSection" data-aos="fade-up" data-aos-delay="100">
            <div className="searchContainer">
              <MdSearch className="searchIcon" />
              <input
                type="text"
                placeholder="Rechercher par nom de fichier, type, service..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="searchInput"
              />
            </div>
            
            {/* Résultats de recherche */}
            {searchTerm.trim() && (
              <div className="searchResults">
                <span className="resultsCount">
                  {filteredCourriers.length} résultat{filteredCourriers.length > 1 ? 's' : ''} trouvé{filteredCourriers.length > 1 ? 's' : ''} pour "{searchTerm}"
                </span>
              </div>
            )}
            
            {/* Pagination Controls - Masquée pendant la recherche */}
            {!searchTerm.trim() && pagination && pagination.totalPages > 1 && (
              <div className="paginationControls">
                <button
                  className="paginationBtn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <MdNavigateBefore /> 
                  Précédent
                </button>
                
                <div className="paginationInfo">
                  <span>Page {currentPage} sur {pagination.totalPages}</span>
                  <span className="totalItems">{pagination.total} courrier{pagination.total > 1 ? 's' : ''}</span>
                </div>
                
                <button
                  className="paginationBtn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Suivant
                  <MdNavigateNext />
                </button>
              </div>
            )}
          </section>

          {/* Courriers List */}
          <section className="courriersSection" data-aos="fade-up" data-aos-delay="200">
            {isLoading ? (
              <div className="loadingState">
                <Loader 
                  size="large" 
                  message="Chargement des courriers..."
                />
              </div>
            ) : filteredCourriers.length === 0 ? (
              <div className="emptyState">
                <FiFileText className="emptyIcon" />
                <p>Aucun courrier trouvé</p>
              </div>
            ) : (
              <div className="courriersTable">
                <div className="tableWrapper">
                  <table className="courriersGrid">
                  <thead>
                    <tr>
                      <th>Nom du fichier</th>
                      <th>Direction</th>
                      <th>Type</th>
                      <th>Service</th>
                      <th>Expéditeur</th>
                      <th className="dateColumn">Date réception</th>
                      <th className="dateColumn">Date courrier</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourriers.map((courrier: ICourrier) => (
                      <tr key={courrier.id} className="courrierRow">
                        <td className="fileName">
                          <div className="fileNameWrapper">
                            <FiFileText className="fileIcon" />
                            <span 
                              className="fileNameText"
                              onMouseEnter={(e) => handleMouseEnter(e, courrier.fileName)}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            >
                              {courrier.fileName}
                            </span>
                          </div>
                        </td>
                        <td className="direction">
                          <span className={`directionBadge ${getDirectionBadge(courrier.direction)}`}>
                            {courrier.direction}
                          </span>
                        </td>
                        <td 
                          className="kind"
                          onMouseEnter={(e) => handleMouseEnter(e, courrier.kind || "N/A")}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                        >
                          {courrier.kind || "N/A"}
                        </td>
                        <td 
                          className="department"
                          onMouseEnter={(e) => handleMouseEnter(e, courrier.department || "N/A")}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                        >
                          {courrier.department || "N/A"}
                        </td>
                        <td 
                          className="emitter"
                          onMouseEnter={(e) => handleMouseEnter(e, courrier.emitter || "N/A")}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                        >
                          {courrier.emitter || "N/A"}
                        </td>
                        <td className="receptionDate">{formatDate(courrier.receptionDate)}</td>
                        <td className="courrierDate">{formatDate(courrier.courrierDate)}</td>
                        <td 
                          className="description"
                          onMouseEnter={(e) => handleMouseEnter(e, courrier.description || "N/A")}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                        >
                          {courrier.description || "N/A"}
                        </td>
                        <td className="actions">
                          <div className="actionButtons">
                            <button 
                              className="actionBtn view"
                              onClick={() => handleViewPdf(courrier)}
                              title="Visualiser"
                            >
                              <MdVisibility />
                            </button>
                            <button 
                              className="actionBtn download"
                              onClick={() => handleDownload(courrier.id)}
                              title="Télécharger"
                            >
                              <MdDownload />
                            </button>
                            <button 
                              className="actionBtn edit"
                              onClick={() => handleEdit(courrier.id)}
                              title="Modifier"
                            >
                              <MdEdit />
                            </button>
                            <button 
                              className="actionBtn email"
                              onClick={() => handleEmail(courrier.id)}
                              title="Envoyer par email"
                            >
                              <MdEmail />
                            </button>
                            <button 
                              className="actionBtn delete"
                              onClick={() => handleDelete(courrier.id)}
                              title="Supprimer"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>
      
      {/* Tooltip personnalisé */}
      {tooltip.visible && (
        <div 
          className="customTooltip"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 10000,
            backgroundColor: 'rgba(44, 62, 80, 0.95)',
            color: 'white',
            padding: '0.75em 1em',
            borderRadius: '8px',
            fontSize: '0.8em',
            maxWidth: '25em',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none'
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Modale PDF/Image */}
      <Modal 
        isVisible={pdfModal.visible}
        onClose={closePdfModal}
        title={pdfModal.fileName || `Visualisation ${pdfModal.fileType.toUpperCase()}`}
      >
        {pdfModal.fileType === 'image' ? (
          <img
            src={pdfModal.pdfUrl}
            alt={pdfModal.fileName}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              border: 'none'
            }}
          />
        ) : (
          <iframe
            src={pdfModal.pdfUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="Visualisation PDF"
          />
        )}
      </Modal>
    </>
  );
}

const ListeCourriersWithAuth = WithAuth(ListeCourriers);
export default ListeCourriersWithAuth;