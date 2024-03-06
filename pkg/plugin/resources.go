package plugin

import (
	"net/http"
)

func (ds *Datasource) handleToc(w http.ResponseWriter, r *http.Request) {
	switch ds.settings.Source {
	case "github":
		ds.fetchGithubToc(w, r)
	default:
		http.Error(w, "Unsupported docbooks source", http.StatusNotImplemented)
		return
	}
}

func (ds *Datasource) registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/table-of-contents", ds.handleToc)
}
