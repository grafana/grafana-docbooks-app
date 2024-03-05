package plugin

import (
	"github.com/google/go-github/v60/github"
	"net/http"
)

func (ds *Datasource) handleToc(w http.ResponseWriter, r *http.Request) {

	client := github.NewClient(nil)

	tree, _, err := client.Git.GetTree(r.Context(), "grafana", "hackathon-2024-03-docbooks-docs", "main", true)

	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}

	var docbooksTree *github.Tree

	for _, entry := range tree.Entries {
		if *entry.Type == "tree" && *entry.Path == "docbooks" {
			innerTree, _, err := client.Git.GetTree(r.Context(), "grafana", "hackathon-2024-03-docbooks-docs", *entry.SHA, true)

			if err != nil {
				w.Write([]byte(err.Error()))
			}
			docbooksTree = innerTree
		}
	}
	if docbooksTree == nil {
		w.Write([]byte("No docbooks found"))
		return
	} else {
		for _, subTree := range docbooksTree.Entries {
			w.Write([]byte(subTree.GetPath() + " " + subTree.GetType() + "\n"))
			if *subTree.Type == "blob" {
				//fileContent, _, _, err := client.Repositories.GetContents(r.Context(), "grafana", "hackathon-2024-03-docbooks-docs", "docbooks/"+subTree.GetPath(), nil)
				//if err != nil {
				//	w.Write([]byte(err.Error()))
				//}
				//if fileContent != nil {
				//	decodedContent, _ := fileContent.GetContent()
				//	w.Write([]byte("\n" + decodedContent + "\n\n"))
				//}
			}
		}
	}
}

func (ds *Datasource) handleHello(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello, adam!"))
}

func (ds *Datasource) registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/hello", ds.handleHello)
	mux.HandleFunc("/toc", ds.handleToc)
}
