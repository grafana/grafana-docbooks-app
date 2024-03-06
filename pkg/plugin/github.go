package plugin

import (
	"encoding/json"
	"github.com/google/go-github/v60/github"
	"net/http"
)

func (ds *Datasource) fetchGithubToc(w http.ResponseWriter, r *http.Request) {
	var docbooksTree *github.Tree

	cacheKey := "toc-" + ds.settings.Owner + "/" + ds.settings.Repo

	if !ds.cache.Contains(cacheKey) {
		client := github.NewClient(nil).WithAuthToken(ds.settings.AuthToken)

		tree, _, err := client.Git.GetTree(r.Context(), ds.settings.Owner, ds.settings.Repo, "main", false)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		for _, entry := range tree.Entries {
			// find the docbooks directory
			if *entry.Type == "tree" && *entry.Path == "docbooks" {
				// recursively fetch the tree for the docbooks directory
				innerTree, _, err := client.Git.GetTree(r.Context(), ds.settings.Owner, ds.settings.Repo, *entry.SHA, true)

				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				docbooksTree = innerTree
				ds.cache.Add(cacheKey, docbooksTree)
			}
		}
	} else {
		cachedTree, ok := ds.cache.Get(cacheKey)
		if ok {
			docbooksTree = cachedTree.(*github.Tree)
		} else {
			http.Error(w, "Failed to fetch docbooks tree from cache", http.StatusInternalServerError)
			return
		}
	}

	if docbooksTree == nil {
		http.Error(w, "No docbooks directory found in source", http.StatusNotFound)
		return
	} else {
		docbooksJson, err := json.Marshal(docbooksTree)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.Write(docbooksJson)
		}
	}
}
