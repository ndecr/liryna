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
  MdNavigateBefore
} from "react-icons/md";
import { FiFileText } from "react-icons/fi";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import Footer from "../../../components/footer/Footer.tsx";
import Button from "../../../components/button/Button.tsx";

// context
import { CourrierContext } from "../../../context/courrier/CourrierContext.tsx";

// types
import { ICourrier } from "../../../utils/types/courrier.types.ts";

function ListeCourriers(): ReactElement {
  const navigate = useNavigate();
  const { courriers, pagination, getAllCourriers, downloadCourrier, deleteCourrier, isLoading } = useContext(CourrierContext);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    loadCourriers(currentPage);
  }, [currentPage]);

  const loadCourriers = async (page: number) => {
    try {
      await getAllCourriers(page, 10);
    } catch (error) {
      console.error("Error loading courriers:", error);
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
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du courrier');
    }
  };

  const handleEdit = (courrierid: number) => {
    // TODO: Rediriger vers la page d'édition du courrier
    console.log('Édition du courrier:', courrierid);
  };

  const handleEmail = (courrierid: number) => {
    // TODO: Ouvrir une modal pour envoyer par email
    console.log('Envoi par email du courrier:', courrierid);
  };

  const handleDelete = async (courrierid: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce courrier ?')) {
      try {
        await deleteCourrier(courrierid);
        loadCourriers(currentPage);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du courrier');
      }
    }
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

          {/* Search */}
          <section className="searchSection" data-aos="fade-up" data-aos-delay="100">
            <div className="searchContainer">
              <MdSearch className="searchIcon" />
              <input
                type="text"
                placeholder="Rechercher par nom de fichier, type, service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="searchInput"
              />
            </div>
          </section>

          {/* Courriers List */}
          <section className="courriersSection" data-aos="fade-up" data-aos-delay="200">
            {isLoading ? (
              <div className="loadingState">
                <p>Chargement des courriers...</p>
              </div>
            ) : filteredCourriers.length === 0 ? (
              <div className="emptyState">
                <FiFileText className="emptyIcon" />
                <p>Aucun courrier trouvé</p>
              </div>
            ) : (
              <div className="courriersTable">
                <table className="courriersGrid">
                  <thead>
                    <tr>
                      <th>Nom du fichier</th>
                      <th>Direction</th>
                      <th>Type</th>
                      <th>Service</th>
                      <th>Expéditeur</th>
                      <th className="dateColumn">Date réception</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourriers.map((courrier: ICourrier) => (
                      <tr key={courrier.id} className="courrierRow" data-aos="fade-up" data-aos-delay="100">
                        <td className="fileName">
                          <div className="fileNameWrapper">
                            <FiFileText className="fileIcon" />
                            <span className="fileNameText" title={courrier.fileName}>
                              {courrier.fileName}
                            </span>
                          </div>
                        </td>
                        <td className="direction">
                          <span className={`directionBadge ${getDirectionBadge(courrier.direction)}`}>
                            {courrier.direction}
                          </span>
                        </td>
                        <td className="kind" title={courrier.kind || "N/A"}>{courrier.kind || "N/A"}</td>
                        <td className="department" title={courrier.department || "N/A"}>{courrier.department || "N/A"}</td>
                        <td className="emitter" title={courrier.emitter || "N/A"}>{courrier.emitter || "N/A"}</td>
                        <td className="receptionDate">{formatDate(courrier.receptionDate)}</td>
                        <td className="actions">
                          <div className="actionButtons">
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
            )}
          </section>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <section className="paginationSection" data-aos="fade-up" data-aos-delay="300">
              <div className="paginationContainer">
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
                  <span className="totalItems">({pagination.total} courriers au total)</span>
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
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

const ListeCourriersWithAuth = WithAuth(ListeCourriers);
export default ListeCourriersWithAuth;